import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const toNotification = (notification) => ({
  ...notification,
  id: notification.id || notification._id,
  time: notification.createdAt
    ? new Date(notification.createdAt).toLocaleString()
    : 'Just now',
});

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('campusresolve_token');
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const mergeNotifications = useCallback((incoming) => {
    setNotifications((current) => {
      const byId = new Map(current.map((item) => [item.id, item]));
      incoming.forEach((item) => byId.set(item.id, { ...byId.get(item.id), ...toNotification(item) }));
      return [...byId.values()]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 50);
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.email || !token) {
      setNotifications([]);
      return undefined;
    }

    const controller = new AbortController();
    let stopped = false;
    const streamUrl = `${api.defaults.baseURL.replace(/\/$/, '')}/notifications/stream`;
    const waitForReconnect = () => new Promise((resolve) => setTimeout(resolve, 3000));

    const loadNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        mergeNotifications((response.data?.data || []).map(toNotification));
      } catch (error) {
        if (
          !controller.signal.aborted &&
          error.response?.status !== 401 &&
          error.response?.status !== 403
        ) {
          console.error('Unable to load in-app notifications:', error.message);
        }
      }
    };

    const handleNotification = (notification) => {
      const normalized = toNotification(notification);
      mergeNotifications([normalized]);
      if (normalized.complaintId) {
        window.dispatchEvent(new CustomEvent('campusresolve:complaint-updated'));
      }
    };

    const consumeStream = async (response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let eventName = '';
      let dataLines = [];

      while (!controller.signal.aborted) {
        const { value, done } = await reader.read();
        if (done) return;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex = buffer.indexOf('\n');
        while (newlineIndex !== -1) {
          const line = buffer.slice(0, newlineIndex).replace(/\r$/, '');
          buffer = buffer.slice(newlineIndex + 1);
          if (line === '') {
            if (eventName === 'notification' && dataLines.length) {
              try {
                handleNotification(JSON.parse(dataLines.join('\n')));
              } catch (error) {
                console.error('Received an invalid notification event:', error.message);
              }
            }
            eventName = '';
            dataLines = [];
          } else if (line.startsWith('event:')) {
            eventName = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trimStart());
          }
          newlineIndex = buffer.indexOf('\n');
        }
      }
    };

    const connect = async () => {
      while (!stopped && !controller.signal.aborted) {
        try {
          const response = await fetch(streamUrl, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });
          if (!response.ok) {
            if (response.status === 401) {
              window.dispatchEvent(new Event('campusresolve:auth-expired'));
              return;
            }
            if (response.status === 403) {
              console.warn('Live notifications require a valid server login.');
              return;
            }
            throw new Error(`Notification stream returned ${response.status}`);
          }
          await loadNotifications();
          await consumeStream(response);
        } catch (error) {
          if (controller.signal.aborted) return;
          console.error('Notification stream disconnected:', error.message);
        }

        if (!stopped && !controller.signal.aborted) {
          await waitForReconnect();
        }
      }
    };

    connect();
    return () => {
      stopped = true;
      controller.abort();
    };
  }, [isAuthenticated, user?.email, user?.role, token, mergeNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Unable to mark notification as read:', error.message);
      toast.error('Could not update this notification. Please try again.');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
    } catch (error) {
      console.error('Unable to mark notifications as read:', error.message);
      toast.error('Could not update notifications. Please try again.');
    }
  };

  const clearNotification = (id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
