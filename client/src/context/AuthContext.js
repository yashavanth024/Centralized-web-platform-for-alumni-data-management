import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  // 🔐 Fetch logged-in user + role-based redirect
  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      const loggedInUser = response.data.user;
      setUser(loggedInUser);

const currentPath = window.location.pathname;

// 🚫 Ignore static files (ID cards, images, PDFs)
if (
  currentPath.startsWith('/uploads') ||
  /\.(pdf|png|jpg|jpeg)$/i.test(currentPath)
) {
  return;
}

// 🔑 ROLE-BASED REDIRECTS
if (
  loggedInUser.role === 'admin' &&
  !currentPath.startsWith('/admin') &&
  currentPath !== '/'
) {
  window.location.href = '/admin/dashboard';
  return;
}

if (
  loggedInUser.role === 'student' &&
  currentPath === '/dashboard'
) {
  window.location.href = '/student/dashboard';
  return;
}

if (
  loggedInUser.role === 'alumni' &&
  currentPath === '/dashboard'
) {
  window.location.href = '/alumni/dashboard';
  return;
}

// ⏳ Unverified user handling (non-admin)
if (
  loggedInUser.role !== 'admin' &&
  !loggedInUser.is_verified &&
  !['/verification-pending', '/logout', '/'].includes(currentPath)
) {
  window.location.href = '/verification-pending';
  return;
}


    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Login
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      // Redirect immediately after login based on role & verification
      if (user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else if (!user.is_verified) {
        window.location.href = '/verification-pending';
      } else if (user.role === 'student') {
        window.location.href = '/student/dashboard';
      } else if (user.role === 'alumni') {
        window.location.href = '/alumni/dashboard';
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // 📝 Register
  const register = async (formData) => {
    try {
      const response = await axios.post('/api/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  };

  // 👤 Update profile
  const updateProfile = async (profileData) => {
    try {
      await axios.put('/api/users/profile', profileData);
      await fetchUser();
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
