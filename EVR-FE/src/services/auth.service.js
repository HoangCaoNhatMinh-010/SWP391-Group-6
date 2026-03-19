import apiClient from './api/axios';
import { ENDPOINTS } from './api/endpoints';

export const authService = {
  register: async (userData, personalIdImage, licenseImage) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
    });
    if (personalIdImage) formData.append('personalIdImage', personalIdImage);
    if (licenseImage) formData.append('licenseImage', licenseImage);
    
    return apiClient.post(ENDPOINTS.REGISTER, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  login: async (email, password) => {
    const response = await apiClient.post(ENDPOINTS.LOGIN, { email, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

