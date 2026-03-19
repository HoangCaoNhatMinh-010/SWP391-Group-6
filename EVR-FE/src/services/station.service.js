import apiClient from './api/axios';
import { ENDPOINTS } from './api/endpoints';

export const stationService = {
  getStations: async () => {
    return apiClient.get(ENDPOINTS.GET_STATIONS);
  },

  getNearbyStations: async (lat, lng, radiusDeg = 0.02) => {
    return apiClient.get(ENDPOINTS.GET_NEARBY_STATIONS, {
      params: { lat, lng, radiusDeg },
    });
  },

  createStation: async (stationData) => {
    return apiClient.post(ENDPOINTS.CREATE_STATION, stationData);
  },

  updateStation: async (id, stationData) => {
    return apiClient.put(ENDPOINTS.UPDATE_STATION(id), stationData);
  },

  deleteStation: async (id) => {
    return apiClient.delete(ENDPOINTS.DELETE_STATION(id));
  },
};

