import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Your FastAPI backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add the token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Function to handle login
const login = async ({ email, password }) => {
  try {
    // Your /login endpoint expects a JSON object
    const response = await apiClient.post('/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
  }
};

// Function to handle registration
const register = async (userData) => {
  try {
    const response = await apiClient.post('/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Registration failed. Please try again.');
  }
};

// Function to get the current user's data
const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data;
  } catch (error) {
    // This can happen if the token is expired or invalid
    console.error("Could not fetch user.", error);
    // Clean up inconsistent state
    localStorage.removeItem('token');
    throw new Error('Session expired. Please login again.');
  }
};

export const api = {
  login,
  register,
  getCurrentUser,
};