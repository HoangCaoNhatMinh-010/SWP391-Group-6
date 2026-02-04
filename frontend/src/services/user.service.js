import apiClient from './api/axios';
import { ENDPOINTS } from './api/endpoints';

export const userService = {
  getUserById: async (id) => {
    return apiClient.get(ENDPOINTS.GET_USER(id));
  },

  updateUser: async (id, userData) => {
    return apiClient.put(ENDPOINTS.UPDATE_USER(id), userData);
  },

  changePassword: async (id, payload) => {
    return apiClient.put(ENDPOINTS.CHANGE_PASSWORD(id), payload);
  },

  verifyUser: async (id, staff) => {
    return apiClient.put(ENDPOINTS.VERIFY_USER(id), staff);
  },

  getAllUsers: async (page = 0, size = 10, role = null, status = null) => {
    const params = { page, size };
    if (role) params.role = role;
    if (status) params.status = status;
    return apiClient.get(ENDPOINTS.GET_ALL_USERS, { params });
  },

  getRiskUsers: async () => {
    return apiClient.get(ENDPOINTS.GET_RISK_USERS);
  },

  updateUserStatus: async (id, status, reason = null) => {
    const params = { status };
    if (reason) params.reason = reason;
    return apiClient.put(ENDPOINTS.UPDATE_USER_STATUS(id), null, { params });
  },
};

