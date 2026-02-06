import apiClient from './api/axios';
import { ENDPOINTS } from './api/endpoints';

export const feedbackService = {
  createFeedback: async (feedbackData, userId) => {
    return apiClient.post(ENDPOINTS.CREATE_FEEDBACK, feedbackData, {
      params: { userId },
    });
  },

  getUserFeedback: async (userId) => {
    return apiClient.get(ENDPOINTS.GET_USER_FEEDBACK, {
      params: { userId },
    });
  },

  getContractFeedback: async (contractId) => {
    return apiClient.get(ENDPOINTS.GET_CONTRACT_FEEDBACK(contractId));
  },
};

