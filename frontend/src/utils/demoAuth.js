import axios from 'axios';

// Base URL for the demo API
const API_BASE_URL = 'http://localhost:8001';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Demo authentication functions
export const demoAuth = {
  /**
   * Demo login with email/password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Response with token and user data
   */
  demoLogin: async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const { access_token, token_type, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('demo_token', access_token);
      localStorage.setItem('demo_user', JSON.stringify(user));
      
      return {
        success: true,
        token: access_token,
        tokenType: token_type,
        user: user
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  },

  /**
   * Demo forgot password - generates reset link
   * @param {string} email - User email
   * @returns {Promise} Response with reset link
   */
  demoForgotPassword: async (email) => {
    try {
      const response = await api.post('/forgot-password', { email });
      const { message, reset_link } = response.data;
      
      return {
        success: true,
        message: message,
        resetLink: reset_link
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to send reset link'
      };
    }
  },

  /**
   * Demo reset password with token
   * @param {string} token - Reset token from URL
   * @param {string} newPassword - New password
   * @returns {Promise} Response with success status
   */
  demoResetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/reset-password', { 
        token: token, 
        new_password: newPassword 
      });
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Password reset failed'
      };
    }
  },

  /**
   * Demo Google OAuth login
   * @returns {Promise} Response with token and user data
   */
  demoGoogleLogin: async () => {
    try {
      const response = await api.get('/auth/google/demo');
      const { access_token, token_type, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('demo_token', access_token);
      localStorage.setItem('demo_user', JSON.stringify(user));
      
      return {
        success: true,
        token: access_token,
        tokenType: token_type,
        user: user
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Google login failed'
      };
    }
  },

  /**
   * Demo Twitter OAuth login
   * @returns {Promise} Response with token and user data
   */
  demoTwitterLogin: async () => {
    try {
      const response = await api.get('/auth/twitter/demo');
      const { access_token, token_type, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('demo_token', access_token);
      localStorage.setItem('demo_user', JSON.stringify(user));
      
      return {
        success: true,
        token: access_token,
        tokenType: token_type,
        user: user
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Twitter login failed'
      };
    }
  },

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Promise} Response with token validity
   */
  verifyToken: async (token) => {
    try {
      const response = await api.get(`/verify-token?token=${token}`);
      return {
        success: true,
        user: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
  },

  /**
   * Logout user - clear localStorage
   */
  logout: () => {
    localStorage.removeItem('demo_token');
    localStorage.removeItem('demo_user');
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User object or null
   */
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('demo_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get current token from localStorage
   * @returns {string|null} Token or null
   */
  getToken: () => {
    return localStorage.getItem('demo_token');
  },

  /**
   * Check if user is logged in
   * @returns {boolean} True if logged in
   */
  isLoggedIn: () => {
    return !!localStorage.getItem('demo_token');
  }
};

// Export individual functions for easier importing
export const {
  demoLogin,
  demoForgotPassword,
  demoResetPassword,
  demoGoogleLogin,
  demoTwitterLogin,
  verifyToken,
  logout,
  getCurrentUser,
  getToken,
  isLoggedIn
} = demoAuth;

export default demoAuth;