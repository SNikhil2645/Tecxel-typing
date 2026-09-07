import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [participant, setParticipant] = useState(null);
  const [participantToken, setParticipantToken] = useState(localStorage.getItem('tecxl_token'));
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('tecxl_admin_token'));
  const [loading, setLoading] = useState(true);

  // Initialize participant auth state from token
  useEffect(() => {
    const initAuth = async () => {
      const storedParticipant = localStorage.getItem('tecxl_participant');
      const storedAdmin = localStorage.getItem('tecxl_admin');

      if (storedParticipant) {
        try {
          setParticipant(JSON.parse(storedParticipant));
        } catch (e) {
          console.error('Failed to parse stored participant');
        }
      }

      if (storedAdmin) {
        try {
          setAdmin(JSON.parse(storedAdmin));
        } catch (e) {
          console.error('Failed to parse stored admin');
        }
      }

      if (participantToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.participant) {
            setParticipant(res.data.participant);
            localStorage.setItem('tecxl_participant', JSON.stringify(res.data.participant));
          }
        } catch (err) {
          console.warn('Could not refresh participant session', err.message);
          // Only clear if 401
          if (err.response && err.response.status === 401) {
            logout();
          }
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [participantToken]);

  const login = async (participantId, password) => {
    const res = await api.post('/auth/login', { participantId, password });
    const { token, participant: user } = res.data;
    localStorage.setItem('tecxl_token', token);
    localStorage.setItem('tecxl_participant', JSON.stringify(user));
    setParticipantToken(token);
    setParticipant(user);
    return user;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token, participant: user, participantId } = res.data;
    localStorage.setItem('tecxl_token', token);
    localStorage.setItem('tecxl_participant', JSON.stringify(user));
    setParticipantToken(token);
    setParticipant(user);
    return { user, participantId };
  };

  const logout = () => {
    localStorage.removeItem('tecxl_token');
    localStorage.removeItem('tecxl_participant');
    setParticipantToken(null);
    setParticipant(null);
  };

  const adminLogin = async (email, password) => {
    const res = await api.post('/auth/admin/login', { email, password });
    const { token, admin: adminData } = res.data;
    localStorage.setItem('tecxl_admin_token', token);
    localStorage.setItem('tecxl_admin', JSON.stringify(adminData));
    setAdminToken(token);
    setAdmin(adminData);
    return adminData;
  };

  const adminLogout = () => {
    localStorage.removeItem('tecxl_admin_token');
    localStorage.removeItem('tecxl_admin');
    setAdminToken(null);
    setAdmin(null);
  };

  const value = {
    participant,
    participantToken,
    isAuthenticated: Boolean(participantToken && participant),
    login,
    register,
    logout,
    admin,
    adminToken,
    isAdminAuthenticated: Boolean(adminToken && admin),
    adminLogin,
    adminLogout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
