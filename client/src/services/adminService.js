import api from './api';

export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getAnalytics: async (days = 30) => {
    const response = await api.get(`/admin/analytics?days=${days}`);
    return response.data;
  },

  // Users
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  updateUserSubscription: async (id, data) => {
    const response = await api.put(`/admin/users/${id}/subscription`, data);
    return response.data;
  },

  // Questions
  getQuestions: async (params = {}) => {
    const response = await api.get('/admin/questions', { params });
    return response.data;
  },

  createQuestion: async (data) => {
    const response = await api.post('/admin/questions', data);
    return response.data;
  },

  updateQuestion: async (id, data) => {
    const response = await api.put(`/admin/questions/${id}`, data);
    return response.data;
  },

  deleteQuestion: async (id) => {
    const response = await api.delete(`/admin/questions/${id}`);
    return response.data;
  },

  bulkCreateQuestions: async (questions) => {
    const response = await api.post('/admin/questions/bulk', { questions });
    return response.data;
  },

  // Exams
  getExams: async (params = {}) => {
    const response = await api.get('/admin/exams', { params });
    return response.data;
  },

  getExam: async (id) => {
    const response = await api.get(`/admin/exams/${id}`);
    return response.data;
  },

  createExam: async (data) => {
    const response = await api.post('/admin/exams', data);
    return response.data;
  },

  updateExam: async (id, data) => {
    const response = await api.put(`/admin/exams/${id}`, data);
    return response.data;
  },

  deleteExam: async (id) => {
    const response = await api.delete(`/admin/exams/${id}`);
    return response.data;
  },

  // Subscription Plans
  getPlans: async () => {
    const response = await api.get('/admin/plans');
    return response.data;
  },

  createPlan: async (data) => {
    const response = await api.post('/admin/plans', data);
    return response.data;
  },

  updatePlan: async (id, data) => {
    const response = await api.put(`/admin/plans/${id}`, data);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await api.delete(`/admin/plans/${id}`);
    return response.data;
  },

  // Payments
  getPayments: async (params = {}) => {
    const response = await api.get('/admin/payments', { params });
    return response.data;
  },

  updatePayment: async (id, data) => {
    const response = await api.put(`/admin/payments/${id}`, data);
    return response.data;
  },

  createPayment: async (data) => {
    const response = await api.post('/admin/payments', data);
    return response.data;
  }
};
