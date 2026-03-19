import apiClient from './api/axios';
import { ENDPOINTS } from './api/endpoints';

export const staffService = {
  createStaff: async (staffData) => {
    return apiClient.post(ENDPOINTS.CREATE_STAFF, staffData);
  },

  getStaff: async (stationId = null) => {
    const params = stationId ? { stationId } : {};
    return apiClient.get(ENDPOINTS.GET_STAFF, { params });
  },

  updateStaff: async (id, staffData) => {
    return apiClient.put(ENDPOINTS.UPDATE_STAFF(id), staffData);
  },

  deleteStaff: async (id) => {
    return apiClient.delete(ENDPOINTS.DELETE_STAFF(id));
  },

  createHandover: async (staffId, contractId, vehicleId, battery, damageDescription, photos, reportType) => {
    const formData = new FormData();
    formData.append('staffId', staffId);
    formData.append('contractId', contractId);
    formData.append('vehicleId', vehicleId);
    formData.append('battery', battery);
    if (damageDescription) formData.append('damageDescription', damageDescription);
    if (photos && photos.length > 0) {
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }
    formData.append('reportType', reportType);

    return apiClient.post(ENDPOINTS.CREATE_HANDOVER, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  createMaintenance: async (staffId, vehicleId, issue, scheduledAt = null) => {
    const params = { staffId, vehicleId, issue };
    if (scheduledAt) params.scheduledAt = scheduledAt;
    return apiClient.post(ENDPOINTS.CREATE_MAINTENANCE, null, { params });
  },

  updateMaintenance: async (id, staffId, status, remarks = null) => {
    const params = { staffId, status };
    if (remarks) params.remarks = remarks;
    return apiClient.put(ENDPOINTS.UPDATE_MAINTENANCE(id), null, { params });
  },

  listMaintenance: async (staffId, status = null) => {
    const params = { staffId };
    if (status) params.status = status;
    return apiClient.get(ENDPOINTS.LIST_MAINTENANCE, { params });
  },
};

