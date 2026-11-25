const Notification = require('../models/Notification');

const connections = new Map();

const connectionKey = (email, role) => `${role}:${email.toLowerCase()}`;

const addConnection = (user, response) => {
  const key = connectionKey(user.email, user.role);
  const userConnections = connections.get(key) || new Set();
  userConnections.add(response);
  connections.set(key, userConnections);

  return () => {
    userConnections.delete(response);
    if (userConnections.size === 0) connections.delete(key);
  };
};

const createNotification = async ({
  recipientEmail,
  recipientRole,
  title,
  message,
  type = 'info',
  link = '',
  complaintId = '',
}) => {
  if (!recipientEmail) return null;

  const notification = await Notification.create({
    recipientEmail: recipientEmail.toLowerCase(),
    recipientRole,
    title,
    message,
    type,
    link,
    complaintId,
  });
  const payload = JSON.stringify({
    ...notification.toObject(),
    id: notification._id.toString(),
  });
  const userConnections = connections.get(
    connectionKey(notification.recipientEmail, notification.recipientRole)
  );

  if (userConnections) {
    for (const response of userConnections) {
      if (!response.writableEnded && !response.destroyed) {
        response.write(`event: notification\ndata: ${payload}\n\n`);
      }
    }
  }

  return notification;
};

module.exports = { addConnection, createNotification };
