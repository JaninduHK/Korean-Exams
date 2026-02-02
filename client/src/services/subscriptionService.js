import api from './api';

export const subscriptionService = {
  getPlans: async () => {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  getCurrent: async () => {
    const response = await api.get('/subscriptions/current');
    return response.data;
  },

  initiatePayHere: async (payload) => {
    const response = await api.post('/subscriptions/payhere/initiate', payload);
    return response.data;
  },

  submitBankTransfer: async (payload) => {
    const response = await api.post('/subscriptions/bank-transfer', payload);
    return response.data;
  },

  getPayments: async () => {
    const response = await api.get('/subscriptions/payments');
    return response.data;
  }
};
