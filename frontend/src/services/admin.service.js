import apiClient from './api/axios';
import { ENDPOINTS } from './api/endpoints';

export const adminService = {
  getFleetSummary: async (stationId = null) => {
    const params = stationId ? { stationId } : {};
    return apiClient.get(ENDPOINTS.GET_FLEET_SUMMARY, { params });
  },

  dispatchVehicle: async (fromStationId, toStationId, vehicleId) => {
    return apiClient.post(ENDPOINTS.DISPATCH_VEHICLE, null, {
      params: { fromStationId, toStationId, vehicleId },
    });
  },

  getCustomers: async () => {
    return apiClient.get(ENDPOINTS.GET_CUSTOMERS);
  },

  flagCustomer: async (id, adminId, reason, riskScore) => {
    return apiClient.post(ENDPOINTS.FLAG_CUSTOMER(id), null, {
      params: { adminId, reason, riskScore },
    });
  },

  updateCustomerStatus: async (id, status, reason = null) => {
    const params = { status };
    if (reason) params.reason = reason;
    return apiClient.put(ENDPOINTS.UPDATE_CUSTOMER_STATUS(id), null, { params });
  },

  getComplaints: async (status = null) => {
    const params = status ? { status } : {};
    return apiClient.get(ENDPOINTS.GET_COMPLAINTS, { params });
  },

  getComplaintById: async (id) => {
    return apiClient.get(ENDPOINTS.GET_COMPLAINT_BY_ID(id));
  },

  respondToComplaint: async (id, adminId, response, status) => {
    return apiClient.put(ENDPOINTS.RESPOND_TO_COMPLAINT(id), null, {
      params: { adminId, response, status },
    });
  },

  getStaff: async (stationId = null) => {
    const params = stationId ? { stationId } : {};
    return apiClient.get(ENDPOINTS.GET_ADMIN_STAFF, { params });
  },

  getStaffPerformance: async (id) => {
    return apiClient.get(ENDPOINTS.GET_STAFF_PERFORMANCE(id));
  },

  createStaffSchedule: async (staffId, stationId, shiftStart, shiftEnd, shiftType) => {
    return apiClient.post(ENDPOINTS.CREATE_STAFF_SCHEDULE, null, {
      params: { staffId, stationId, shiftStart, shiftEnd, shiftType },
    });
  },

  getRevenueReport: async (stationId = null, from = null, to = null) => {
    const params = {};
    if (stationId) params.stationId = stationId;
    if (from) params.from = from;
    if (to) params.to = to;
    return apiClient.get(ENDPOINTS.GET_REVENUE_REPORT, { params });
  },

  getUtilizationReport: async (stationId = null) => {
    const params = stationId ? { stationId } : {};
    return apiClient.get(ENDPOINTS.GET_UTILIZATION_REPORT, { params });
  },

  getPeakHoursAnalysis: async (stationId = null) => {
    const params = stationId ? { stationId } : {};
    return apiClient.get(ENDPOINTS.GET_PEAK_HOURS, { params });
  },

  getDemandForecast: async (stationId = null) => {
    const params = stationId ? { stationId } : {};
    return apiClient.get(ENDPOINTS.GET_DEMAND_FORECAST, { params });
  },
};

