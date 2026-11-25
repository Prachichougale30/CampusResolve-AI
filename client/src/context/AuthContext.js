import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_STUDENTS, MOCK_STAFF, MOCK_ADMIN } from '../data/mockData';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Read session from localStorage on initial load
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('campusresolve_token');
    return !!token;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    const token = localStorage.getItem('campusresolve_token');
    if (!token) return null;
    return localStorage.getItem('campusresolve_role') || null;
  });

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('campusresolve_token');
    if (!token) return null;
    const saved = localStorage.getItem('campusresolve_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (isAuthenticated && user && currentRole) {
      localStorage.setItem('campusresolve_role', currentRole);
      localStorage.setItem('campusresolve_user', JSON.stringify(user));
    }
  }, [isAuthenticated, currentRole, user]);

  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem('campusresolve_token');
      localStorage.removeItem('campusresolve_role');
      localStorage.removeItem('campusresolve_user');
      setUser(null);
      setCurrentRole(null);
      setIsAuthenticated(false);
      toast.error('Your session expired. Please sign in again to continue.');
    };

    window.addEventListener('campusresolve:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('campusresolve:auth-expired', handleAuthExpired);
  }, []);

  /**
   * Helper to retrieve all registered users from localStorage
   */
  const getStoredUsers = () => {
    try {
      const raw = localStorage.getItem('campusresolve_registered_users');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  /**
  * Login function supporting backend accounts and local demo accounts.
   */
  const login = async (identifier = '', password = '') => {
    const cleanIdentifier = identifier.trim();
    const cleanEmail = cleanIdentifier.toLowerCase();

    // 1. Try real backend database login first
    try {
      const res = await api.post('/auth/login', {
        identifier: cleanIdentifier,
        password,
      });

      if (res.data?.success && res.data?.user) {
        const serverUser = res.data.user;
        const token = res.data.token || 'jwt_token_' + Date.now();
        localStorage.setItem('campusresolve_token', token);
        localStorage.setItem('campusresolve_role', serverUser.role);
        localStorage.setItem('campusresolve_user', JSON.stringify(serverUser));

        setUser(serverUser);
        setCurrentRole(serverUser.role);
        setIsAuthenticated(true);

        return { success: true, user: serverUser };
      }
    } catch (apiError) {
      if (apiError.response) {
        return {
          success: false,
          message: apiError.response.data?.message || 'Email or password is incorrect.',
        };
      }
      console.warn('Backend login unavailable or returned error, checking registered accounts:', apiError.message);
    }

    if (!cleanIdentifier.includes('@')) {
      return {
        success: false,
        message: 'Admin ID sign-in requires a connection to the server.',
      };
    }

    // 2. Check newly registered users stored in localStorage
    const storedUsers = getStoredUsers();
    const matchedRegistered = storedUsers.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (matchedRegistered) {
      if (matchedRegistered.role === 'admin') {
        return {
          success: false,
          message: 'Admin sign-in requires a connection to the server.',
        };
      }

      const roleToUse = matchedRegistered.role || 'student';
      const token = 'jwt_token_' + Date.now();
      localStorage.setItem('campusresolve_token', token);
      localStorage.setItem('campusresolve_role', roleToUse);
      localStorage.setItem('campusresolve_user', JSON.stringify(matchedRegistered));

      setUser(matchedRegistered);
      setCurrentRole(roleToUse);
      setIsAuthenticated(true);

      return { success: true, user: matchedRegistered };
    }

    // 3. Fallback to existing mock accounts so demo accounts always work
    let allStaff = MOCK_STAFF;
    try {
      const storedStaff = localStorage.getItem('campusresolve_staff_v1');
      if (storedStaff) {
        allStaff = JSON.parse(storedStaff);
      }
    } catch (e) {
      allStaff = MOCK_STAFF;
    }

    const matchedStaff = allStaff.find(
      (staff) => staff.email?.toLowerCase() === cleanEmail
    );
    const matchedStudent = MOCK_STUDENTS.find(
      (student) => student.email.toLowerCase() === cleanEmail
    );
    let account;

    if (cleanEmail === MOCK_ADMIN.email.toLowerCase()) {
      return {
        success: false,
        message: 'Admin sign-in requires a connection to the server.',
      };
    } else if (matchedStaff) {
      account = {
        ...matchedStaff,
        role: 'staff',
        roleLabel: `${matchedStaff.name} (${matchedStaff.department} Technician)`,
      };
    } else if (matchedStudent) {
      account = {
        ...matchedStudent,
        role: 'student',
        roleLabel: 'Student',
      };
    } else {
      account = {
        id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: cleanEmail,
        rollNo: 'CS2024-' + Math.floor(100 + Math.random() * 900),
        department: 'Computer Science & Engineering',
        year: '4th Year (Sem 7)',
        division: 'A',
        hostel: 'Hostel Block B - Room 314',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'student',
        roleLabel: 'Student',
      };
    }

    const token = 'jwt_token_' + Date.now();
    const roleToUse = account.role;
    localStorage.setItem('campusresolve_token', token);
    localStorage.setItem('campusresolve_role', roleToUse);
    localStorage.setItem('campusresolve_user', JSON.stringify(account));

    setUser(account);
    setCurrentRole(roleToUse);
    setIsAuthenticated(true);

    return { success: true, user: account };
  };

  /**
   * Register function supporting backend storage and local fallback registration.
   */
  const register = async (userData) => {
    if (userData.role === 'admin') {
      return {
        success: false,
        message: 'Administrator accounts must be provisioned by a system administrator.',
      };
    }

    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const cleanUserId = (userData.userId || userData.rollNo || '').trim();

    const newUserObject = {
      id: cleanUserId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: userData.name?.trim(),
      email: cleanEmail,
      rollNo: cleanUserId || userData.rollNo || 'CS2024-NEW',
      userId: cleanUserId,
      department: userData.department || 'Computer Science & Engineering',
      division: userData.division || 'A',
      year: userData.year || '4th Year',
      hostel: userData.hostel || 'Hostel Block A',
      phone: userData.phone || '+91 99999 00000',
      avatar:
        userData.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: userData.role || 'student',
      roleLabel:
        userData.role === 'admin'
          ? 'Campus Administrator'
          : userData.role === 'staff'
          ? `${userData.name} (${userData.department} Technician)`
          : 'Student',
    };

    // 1. Attempt database registration via backend API
    try {
      const res = await api.post('/auth/register', {
        ...userData,
        email: cleanEmail,
        userId: cleanUserId,
      });

      if (res.data?.success) {
        const { token, user: serverUser } = res.data;
        const mergedUser = {
          ...newUserObject,
          ...serverUser,
          id: serverUser.id || serverUser.userId || cleanUserId,
        };

        // Save in persistent registered users list
        const storedUsers = getStoredUsers();
        const existingIdx = storedUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);
        if (existingIdx >= 0) {
          storedUsers[existingIdx] = mergedUser;
        } else {
          storedUsers.push(mergedUser);
        }
        localStorage.setItem('campusresolve_registered_users', JSON.stringify(storedUsers));

        localStorage.setItem('campusresolve_token', token);
        localStorage.setItem('campusresolve_role', mergedUser.role);
        localStorage.setItem('campusresolve_user', JSON.stringify(mergedUser));

        setCurrentRole(mergedUser.role);
        setUser(mergedUser);
        setIsAuthenticated(true);

        return { success: true, user: mergedUser };
      }
    } catch (apiError) {
      if (apiError.response && apiError.response.data && apiError.response.data.message) {
        return { success: false, message: apiError.response.data.message };
      }
      console.warn('Backend registration failed, proceeding with validated local registration:', apiError.message);
    }

    // Save in persistent registered users list so user can sign in anytime later
    const storedUsers = getStoredUsers();
    const existingIdx = storedUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (existingIdx >= 0) {
      storedUsers[existingIdx] = newUserObject;
    } else {
      storedUsers.push(newUserObject);
    }
    localStorage.setItem('campusresolve_registered_users', JSON.stringify(storedUsers));

    const token = 'jwt_token_' + Date.now();
    localStorage.setItem('campusresolve_token', token);
    localStorage.setItem('campusresolve_role', newUserObject.role);
    localStorage.setItem('campusresolve_user', JSON.stringify(newUserObject));

    setCurrentRole(newUserObject.role);
    setUser(newUserObject);
    setIsAuthenticated(true);

    return { success: true, user: newUserObject };
  };

  const logout = () => {
    localStorage.removeItem('campusresolve_token');
    localStorage.removeItem('campusresolve_role');
    localStorage.removeItem('campusresolve_user');

    setUser(null);
    setCurrentRole(null);
    setIsAuthenticated(false);
    toast.success('Signed out successfully');
  };

  const updateProfile = async (profileUpdates) => {
    setUser((prev) => {
      const updated = { ...prev, ...profileUpdates };
      localStorage.setItem('campusresolve_user', JSON.stringify(updated));

      // Update in registered users list as well
      const storedUsers = getStoredUsers();
      const updatedList = storedUsers.map((u) =>
        u.email?.toLowerCase() === updated.email?.toLowerCase() ? { ...u, ...profileUpdates } : u
      );
      localStorage.setItem('campusresolve_registered_users', JSON.stringify(updatedList));

      return updated;
    });

    // Sync to backend MongoDB database
    try {
      if (user?.email) {
        await api.put('/auth/profile', {
          email: user.email,
          ...profileUpdates,
        });
      }
    } catch (err) {
      console.warn('Backend profile update sync notice:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
