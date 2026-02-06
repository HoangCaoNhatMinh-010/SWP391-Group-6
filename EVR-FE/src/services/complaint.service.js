import apiClient from './api/axios';
import { ENDPOINTS } from './api/endpoints';

export const complaintService = {
  createComplaint: async (complaintData, userId) => {
    return apiClient.post(ENDPOINTS.CREATE_COMPLAINT, complaintData, {
      params: { userId },
    });
  },

  getUserComplaints: async (userId) => {
    return apiClient.get(ENDPOINTS.GET_USER_COMPLAINTS, {
      params: { userId },
    });
  },

  getComplaint: async (id) => {
    return apiClient.get(ENDPOINTS.GET_COMPLAINT(id));
  },
};

