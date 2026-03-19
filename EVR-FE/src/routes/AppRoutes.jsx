import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { USER_ROLES } from '@utils/constants';

// Public Pages
import LoginPage from '@pages/public/Login/LoginPage';
import RegisterPage from '@pages/public/Register/RegisterPage';
import RegistrationSuccessPage from '@pages/public/Register/RegistrationSuccessPage';
import LandingPage from '@pages/public/Landing/LandingPage';
import StationsListPage from '@pages/public/Stations/StationsListPage';
import NearbyStationsPage from '@pages/public/Stations/NearbyStationsPage';
import AvailableVehiclesPage from '@pages/public/Vehicles/AvailableVehiclesPage';
import VehicleDetailsPage from '@pages/public/Vehicles/VehicleDetailsPage';
import VehicleSearchPage from '@pages/public/Vehicles/VehicleSearchPage';
import ReportIssuePage from '@pages/public/Vehicles/ReportIssuePage';

// Customer Pages
import CustomerDashboardPage from '@pages/customer/Dashboard/CustomerDashboardPage';
import ProfilePage from '@pages/customer/Profile/ProfilePage';
import EditProfilePage from '@pages/customer/Profile/EditProfilePage';
import ChangePasswordPage from '@pages/customer/Profile/ChangePasswordPage';
import CreateBookingPage from '@pages/customer/Bookings/CreateBookingPage';
import BookingDetailsPage from '@pages/customer/Bookings/BookingDetailsPage';
import BookingHistoryPage from '@pages/customer/Bookings/BookingHistoryPage';
import ModifyBookingPage from '@pages/customer/Bookings/ModifyBookingPage';
import SettlementPage from '@pages/customer/Bookings/SettlementPage';
import UserAnalyticsPage from '@pages/customer/Analytics/UserAnalyticsPage';
import AdvancedAnalyticsPage from '@pages/customer/Analytics/AdvancedAnalyticsPage';
import FeedbackComplaintPage from '@pages/customer/Feedback/FeedbackComplaintPage';

// Staff Pages
import StaffDashboardPage from '@pages/staff/Dashboard/StaffDashboardPage';
import StaffCheckInPage from '@pages/staff/Bookings/StaffCheckInPage';
import StaffReturnPage from '@pages/staff/Bookings/StaffReturnPage';
import StaffCheckInQueuePage from '@pages/staff/Bookings/StaffCheckInQueuePage';
import StaffReturnQueuePage from '@pages/staff/Bookings/StaffReturnQueuePage';
import ReturnInspectionPage from '@pages/staff/Bookings/ReturnInspectionPage';
import MaintenanceListPage from '@pages/staff/Maintenance/MaintenanceListPage';
import CreateMaintenancePage from '@pages/staff/Maintenance/CreateMaintenancePage';
import EditMaintenancePage from '@pages/staff/Maintenance/EditMaintenancePage';
import CreateHandoverPage from '@pages/staff/Handover/CreateHandoverPage';
import ContractsManagementPage from '@pages/staff/Contracts/ContractsManagementPage';
import ContractDetailsPage from '@pages/staff/Contracts/ContractDetailsPage';

// Admin Pages
import AdminDashboardPage from '@pages/admin/Dashboard/AdminDashboardPage';
import UserManagementPage from '@pages/admin/Users/UserManagementPage';
import UserVerificationPage from '@pages/admin/Users/UserVerificationPage';
import RiskUsersPage from '@pages/admin/Users/RiskUsersPage';
import CustomerManagementPage from '@pages/admin/Customers/CustomerManagementPage';
import FlagCustomerPage from '@pages/admin/Customers/FlagCustomerPage';
import ComplaintsManagementPage from '@pages/admin/Complaints/ComplaintsManagementPage';
import RespondToComplaintPage from '@pages/admin/Complaints/RespondToComplaintPage';
import StationsManagementPage from '@pages/admin/Stations/StationsManagementPage';
import CreateStationPage from '@pages/admin/Stations/CreateStationPage';
import EditStationPage from '@pages/admin/Stations/EditStationPage';
import VehiclesManagementPage from '@pages/admin/Vehicles/VehiclesManagementPage';
import CreateVehiclePage from '@pages/admin/Vehicles/CreateVehiclePage';
import EditVehiclePage from '@pages/admin/Vehicles/EditVehiclePage';
import FleetDispatchPage from '@pages/admin/Fleet/FleetDispatchPage';
import StaffManagementPage from '@pages/admin/Staff/StaffManagementPage';
import CreateStaffPage from '@pages/admin/Staff/CreateStaffPage';
import EditStaffPage from '@pages/admin/Staff/EditStaffPage';
import StaffPerformancePage from '@pages/admin/Staff/StaffPerformancePage';
import CreateStaffSchedulePage from '@pages/admin/Staff/CreateStaffSchedulePage';
import RevenueReportPage from '@pages/admin/Reports/RevenueReportPage';
import UtilizationReportPage from '@pages/admin/Reports/UtilizationReportPage';
import PeakHoursAnalysisPage from '@pages/admin/Reports/PeakHoursAnalysisPage';
import DemandForecastPage from '@pages/admin/Reports/DemandForecastPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/success" element={<RegistrationSuccessPage />} />
          <Route path="/stations" element={<StationsListPage />} />
          <Route path="/stations/nearby" element={<NearbyStationsPage />} />
          <Route path="/vehicles/available" element={<AvailableVehiclesPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
          <Route path="/vehicles/:id/report-issue" element={<ReportIssuePage />} />
          <Route path="/vehicles/search" element={<VehicleSearchPage />} />

          {/* Customer Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
                <CustomerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/security"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/create"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
                <CreateBookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
                <BookingDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id/modify"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
                <ModifyBookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/history"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
                <BookingHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id/settlement"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
                <SettlementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
                <UserAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics/advanced"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
                <AdvancedAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
                <FeedbackComplaintPage />
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.STAFF}>
                <StaffDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/bookings/:id/checkin"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.STAFF}>
                <StaffCheckInPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/bookings/check-in"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.STAFF}>
                <StaffCheckInQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/bookings/:id/return"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.STAFF}>
                <StaffReturnPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/bookings/return"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.STAFF}>
                <StaffReturnQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/bookings/:id/return-inspection"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.STAFF}>
                <ReturnInspectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/maintenance"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.STAFF}>
                <MaintenanceListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/maintenance/create"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.STAFF}>
                <CreateMaintenancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/maintenance/:id/edit"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.STAFF}>
                <EditMaintenancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/handover/create"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.STAFF}>
                <CreateHandoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/contracts"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.STAFF}>
                <ContractsManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/contracts/:id"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.STAFF}>
                <ContractDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/verify"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <UserVerificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/risk"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <RiskUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <CustomerManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers/:id/flag"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <FlagCustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <ComplaintsManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints/:id/respond"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <RespondToComplaintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stations"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <StationsManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stations/create"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <CreateStationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stations/:id/edit"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <EditStationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vehicles"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <VehiclesManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vehicles/create"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <CreateVehiclePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vehicles/:id/edit"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <EditVehiclePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <StaffManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff/create"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <CreateStaffPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff/:id/edit"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <EditStaffPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff/:id/performance"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <StaffPerformancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff/schedule/create"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <CreateStaffSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fleet/dispatch"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <FleetDispatchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/revenue"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <RevenueReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/utilization"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <UtilizationReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/peaks"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <PeakHoursAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/forecast"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <DemandForecastPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Navigate to="/" replace />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;

