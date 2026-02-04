import apiClient from './api/axios';
import { ENDPOINTS } from './api/endpoints';

export const bookingService = {
  createBooking: async (bookingData, userId) => {
    return apiClient.post(ENDPOINTS.CREATE_BOOKING, bookingData, {
      params: { userId },
    });
  },

  getBooking: async (id) => {
    return apiClient.get(ENDPOINTS.GET_BOOKING(id));
  },

  checkIn: async (id, userId, staff) => {
    return apiClient.put(ENDPOINTS.CHECKIN_BOOKING(id), staff, {
      params: { userId },
    });
  },

  returnVehicle: async (id, userId, staff) => {
    return apiClient.put(ENDPOINTS.RETURN_BOOKING(id), staff, {
      params: { userId },
    });
  },

  getUserBookings: async (userId) => {
    return apiClient.get(ENDPOINTS.GET_USER_BOOKINGS, {
      params: { userId },
    });
  },

  getUserBookingsAdvanced: async (userId, status = null, fromDate = null, toDate = null, page = 0, size = 10) => {
    const params = { page, size };
    if (status) params.status = status;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return apiClient.get(ENDPOINTS.GET_USER_BOOKINGS_ADVANCED(userId), { params });
  },

  modifyBooking: async (id, updates, userId) => {
    return apiClient.put(ENDPOINTS.MODIFY_BOOKING(id), updates, {
      params: { userId },
    });
  },

  cancelBooking: async (id, userId) => {
    return apiClient.delete(ENDPOINTS.CANCEL_BOOKING(id), {
      params: { userId },
    });
  },

  denyBooking: async (id, staffId, reason = null) => {
    return apiClient.put(ENDPOINTS.DENY_BOOKING(id), reason ? { reason } : null, {
      params: { staffId },
    });
  },

  settleBooking: async (id, userId) => {
    return apiClient.post(ENDPOINTS.SETTLE_BOOKING(id), null, {
      params: { userId },
    });
  },

  getUserAnalytics: async (userId) => {
    return apiClient.get(ENDPOINTS.GET_USER_ANALYTICS, {
      params: { userId },
    });
  },

  getAdvancedAnalytics: async (userId) => {
    return apiClient.get(ENDPOINTS.GET_ADVANCED_ANALYTICS, {
      params: { userId },
    });
  },

  returnInspection: async (id, userId) => {
    return apiClient.post(ENDPOINTS.RETURN_INSPECTION(id), null, {
      params: { userId },
    });
  },

  getStaffCheckInQueue: async (staffId) => {
    return apiClient.get(ENDPOINTS.STAFF_CHECKIN_QUEUE, {
      params: { staffId },
    });
  },

  getStaffReturnQueue: async (staffId) => {
    return apiClient.get(ENDPOINTS.STAFF_RETURN_QUEUE, {
      params: { staffId },
    });
  },

  getStaffContracts: async (staffId) => {
    return apiClient.get(ENDPOINTS.STAFF_CONTRACTS, {
      params: { staffId },
    });
  },

  getContractByBookingId: async (bookingId) => {
    return apiClient.get(ENDPOINTS.STAFF_CONTRACT_BY_BOOKING(bookingId));
  },
};

