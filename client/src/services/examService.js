import api from './api';

export const examService = {
  // Get all exams
  getExams: async (params = {}) => {
    const response = await api.get('/exams', { params });
    return response.data;
  },

  // Get single exam
  getExam: async (id) => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },

  // Get exam for taking (without answers)
  getExamForTaking: async (id) => {
    const response = await api.get(`/exams/${id}/take`);
    return response.data;
  },

  // Get featured exams
  getFeaturedExams: async () => {
    const response = await api.get('/exams/featured');
    return response.data;
  },

  // Start exam attempt
  startAttempt: async (examId) => {
    const response = await api.post('/attempts/start', { examId });
    return response.data;
  },

  // Save single answer
  saveAnswer: async (attemptId, answerData) => {
    const response = await api.put(`/attempts/${attemptId}/answer`, answerData);
    return response.data;
  },

  // Save multiple answers (batch)
  saveAnswers: async (attemptId, data) => {
    const response = await api.put(`/attempts/${attemptId}/answers`, data);
    return response.data;
  },

  // Mark question for review
  markQuestion: async (attemptId, questionId, marked) => {
    const response = await api.put(`/attempts/${attemptId}/mark`, { questionId, marked });
    return response.data;
  },

  // Submit exam
  submitAttempt: async (attemptId, data) => {
    const response = await api.put(`/attempts/${attemptId}/submit`, data);
    return response.data;
  },

  // Get attempt details
  getAttempt: async (attemptId) => {
    const response = await api.get(`/attempts/${attemptId}`);
    return response.data;
  },

  // Get all user attempts
  getUserAttempts: async (params = {}) => {
    const response = await api.get('/attempts', { params });
    return response.data;
  },

  // Get attempt review
  getAttemptReview: async (attemptId) => {
    const response = await api.get(`/attempts/${attemptId}/review`);
    return response.data;
  },

  // Abandon attempt
  abandonAttempt: async (attemptId) => {
    const response = await api.put(`/attempts/${attemptId}/abandon`);
    return response.data;
  }
};
