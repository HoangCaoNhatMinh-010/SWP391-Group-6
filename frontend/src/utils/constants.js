// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Route Paths
export const ROUTES = {
  // Public
  LOGIN: '/login',
  REGISTER: '/register',
  STATIONS: '/stations',
  STATIONS_NEARBY: '/stations/nearby',
  VEHICLES_AVAILABLE: '/vehicles/available',
  VEHICLES_DETAILS: '/vehicles/:id',
  VEHICLES_SEARCH: '/vehicles/search',
  
  // Customer
  CUSTOMER_DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  BOOKINGS_CREATE: '/bookings/create',
  BOOKINGS_DETAILS: '/bookings/:id',
  BOOKINGS_HISTORY: '/bookings/history',
  BOOKINGS_SETTLEMENT: '/bookings/:id/settlement',
  
  // Staff
  STAFF_DASHBOARD: '/staff/dashboard',
  STAFF_CHECKIN: '/staff/bookings/:id/checkin',
  STAFF_RETURN: '/staff/bookings/:id/return',
  STAFF_MAINTENANCE: '/staff/maintenance',
  STAFF_MAINTENANCE_CREATE: '/staff/maintenance/create',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_STATIONS: '/admin/stations',
  ADMIN_STATIONS_CREATE: '/admin/stations/create',
  ADMIN_STATIONS_EDIT: '/admin/stations/:id/edit',
  ADMIN_VEHICLES: '/admin/vehicles',
  ADMIN_VEHICLES_CREATE: '/admin/vehicles/create',
  ADMIN_VEHICLES_EDIT: '/admin/vehicles/:id/edit',
  ADMIN_STAFF: '/admin/staff',
  ADMIN_STAFF_CREATE: '/admin/staff/create',
  ADMIN_STAFF_EDIT: '/admin/staff/:id/edit',
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'Customer',
  STAFF: 'Staff',
  ADMIN: 'Admin',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  IN_PROGRESS: 'IN_PROGRESS',
  RETURNED: 'RETURNED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Vehicle Status
export const VEHICLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
};

