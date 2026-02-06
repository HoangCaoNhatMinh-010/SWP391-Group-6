// API Endpoints
export const ENDPOINTS = {
  // Auth
  REGISTER: '/users/register',
  LOGIN: '/users/login',
  GET_USER: (id) => `/users/${id}`,
  UPDATE_USER: (id) => `/users/${id}`,
  CHANGE_PASSWORD: (id) => `/users/${id}/password`,
  VERIFY_USER: (id) => `/users/${id}/verify`,
  GET_ALL_USERS: '/users',
  GET_RISK_USERS: '/users/risk',
  UPDATE_USER_STATUS: (id) => `/users/${id}/status`,
  
  // Stations
  GET_STATIONS: '/stations',
  GET_NEARBY_STATIONS: '/stations/nearby',
  CREATE_STATION: '/stations',
  UPDATE_STATION: (id) => `/stations/${id}`,
  DELETE_STATION: (id) => `/stations/${id}`,
  
  // Vehicles
  GET_AVAILABLE_VEHICLES: '/vehicles/available',
  GET_VEHICLE: (id) => `/vehicles/${id}`,
  GET_VEHICLES: '/vehicles',
  REPORT_VEHICLE_ISSUE: (id) => `/vehicles/${id}/report`,
  CREATE_VEHICLE: '/vehicles',
  UPDATE_VEHICLE: (id) => `/vehicles/${id}`,
  DELETE_VEHICLE: (id) => `/vehicles/${id}`,
  
  // Bookings
  CREATE_BOOKING: '/bookings',
  GET_BOOKING: (id) => `/bookings/${id}`,
  CHECKIN_BOOKING: (id) => `/bookings/${id}/checkin`,
  RETURN_BOOKING: (id) => `/bookings/${id}/return`,
  GET_USER_BOOKINGS: '/bookings/user',
  GET_USER_BOOKINGS_ADVANCED: (userId) => `/bookings/user/${userId}`,
  MODIFY_BOOKING: (id) => `/bookings/${id}`,
  CANCEL_BOOKING: (id) => `/bookings/${id}`,
  DENY_BOOKING: (id) => `/bookings/${id}/deny`,
  SETTLE_BOOKING: (id) => `/bookings/${id}/settlement`,
  RETURN_INSPECTION: (id) => `/bookings/${id}/return-inspection`,
  
  // Analytics
  GET_USER_ANALYTICS: '/analytics/user',
  GET_ADVANCED_ANALYTICS: '/analytics/user/advanced',

  // Staff bookings queue
  STAFF_CHECKIN_QUEUE: '/staff/bookings/checkin-queue',
  STAFF_RETURN_QUEUE: '/staff/bookings/return-queue',
  STAFF_CONTRACTS: '/staff/bookings/contracts',
  STAFF_CONTRACT_BY_BOOKING: (bookingId) => `/staff/bookings/${bookingId}/contract`,
  
  // Admin
  GET_FLEET_SUMMARY: '/admin/fleet/summary',
  DISPATCH_VEHICLE: '/admin/fleet/dispatch',
  GET_CUSTOMERS: '/admin/customers',
  FLAG_CUSTOMER: (id) => `/admin/customers/${id}/flag`,
  UPDATE_CUSTOMER_STATUS: (id) => `/admin/customers/${id}/status`,
  GET_COMPLAINTS: '/admin/complaints',
  GET_COMPLAINT_BY_ID: (id) => `/admin/complaints/${id}`,
  RESPOND_TO_COMPLAINT: (id) => `/admin/complaints/${id}/respond`,
  GET_ADMIN_STAFF: '/admin/staff',
  GET_STAFF_PERFORMANCE: (id) => `/admin/staff/${id}/performance`,
  CREATE_STAFF_SCHEDULE: '/admin/staff/schedule',
  GET_REVENUE_REPORT: '/admin/reports/revenue',
  GET_UTILIZATION_REPORT: '/admin/reports/utilization',
  GET_PEAK_HOURS: '/admin/reports/peaks',
  GET_DEMAND_FORECAST: '/admin/reports/forecast',
  
  // Staff
  CREATE_STAFF: '/staff',
  GET_STAFF: '/staff',
  UPDATE_STAFF: (id) => `/staff/${id}`,
  DELETE_STAFF: (id) => `/staff/${id}`,
  
  // Station Staff
  CREATE_HANDOVER: '/staff/handover',
  CREATE_MAINTENANCE: '/staff/maintenance',
  UPDATE_MAINTENANCE: (id) => `/staff/maintenance/${id}`,
  LIST_MAINTENANCE: '/staff/maintenance',
  
  // Feedback
  CREATE_FEEDBACK: '/feedback',
  GET_USER_FEEDBACK: '/feedback/user',
  GET_CONTRACT_FEEDBACK: (contractId) => `/feedback/contract/${contractId}`,
  
  // Complaints
  CREATE_COMPLAINT: '/complaints',
  GET_USER_COMPLAINTS: '/complaints/user',
  GET_COMPLAINT: (id) => `/complaints/${id}`,
};

