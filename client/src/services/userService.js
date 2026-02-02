import api from './api';

export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  // Get user statistics
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Get user activity
  getActivity: async (params = {}) => {
    const response = await api.get('/users/activity', { params });
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  }
};
