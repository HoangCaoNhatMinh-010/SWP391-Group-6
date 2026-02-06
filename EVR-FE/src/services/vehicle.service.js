import apiClient from './api/axios';
import { ENDPOINTS } from './api/endpoints';

export const vehicleService = {
  getAvailableVehicles: async (stationId) => {
    return apiClient.get(ENDPOINTS.GET_AVAILABLE_VEHICLES, {
      params: { stationId },
    });
  },

  getVehicle: async (id) => {
    return apiClient.get(ENDPOINTS.GET_VEHICLE(id));
  },

  getVehicles: async (modelId = null, minBattery = null, page = null, size = null, status = null) => {
    const params = {};
    if (modelId) params.modelId = modelId;
    if (minBattery) params.minBattery = minBattery;
    if (page !== null) params.page = page;
    if (size !== null) params.size = size;
    if (status) params.status = status;
    
    const response = await apiClient.get(ENDPOINTS.GET_VEHICLES, { params });
    
    // If pagination response
    if (response && typeof response === 'object' && 'vehicles' in response) {
      return response;
    }
    
    // Legacy response (array)
    if (Array.isArray(response)) {
      return {
        vehicles: response,
        currentPage: 0,
        totalItems: response.length,
        totalPages: 1,
      };
    }
    
    return {
      vehicles: [],
      currentPage: 0,
      totalItems: 0,
      totalPages: 0,
    };
  },

  reportVehicleIssue: async (id, userId, issueCategory, priority, description, photos = []) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('issueCategory', issueCategory);
    formData.append('priority', priority);
    formData.append('description', description);
    photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    return apiClient.post(ENDPOINTS.REPORT_VEHICLE_ISSUE(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  createVehicle: async (vehicleData) => {
    return apiClient.post(ENDPOINTS.CREATE_VEHICLE, vehicleData);
  },

  updateVehicle: async (id, vehicleData) => {
    return apiClient.put(ENDPOINTS.UPDATE_VEHICLE(id), vehicleData);
  },

  deleteVehicle: async (id) => {
    return apiClient.delete(ENDPOINTS.DELETE_VEHICLE(id));
  },
};

