package com.group7.evr.service.impl;

import com.group7.evr.entity.*;
import com.group7.evr.enums.BookingStatus;
import com.group7.evr.enums.ComplaintStatus;
import com.group7.evr.enums.VehicleStatus;
import com.group7.evr.repository.*;
import com.group7.evr.service.AdminService;
import com.group7.evr.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminServiceImpl implements AdminService {
    @Autowired
    private VehicleRepository vehicleRepository;
    @Autowired
    private StationRepository stationRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ComplaintRepository complaintRepository;
    @Autowired
    private UserService userService;

    @Override
    public Map<String, Object> getFleetSummary(Integer stationId) {
        List<Vehicle> vehicles = vehicleRepository.findByStationStationIdAndStatus(stationId, VehicleStatus.AVAILABLE);
        List<Vehicle> rentedVehicles = vehicleRepository.findByStationStationIdAndStatus(stationId, VehicleStatus.RENTED);
        List<Vehicle> maintenanceVehicles = vehicleRepository.findByStationStationIdAndStatus(stationId, VehicleStatus.MAINTENANCE);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalVehicles", vehicles.size() + rentedVehicles.size() + maintenanceVehicles.size());
        summary.put("availableVehicles", vehicles.size());
        summary.put("rentedVehicles", rentedVehicles.size());
        summary.put("maintenanceVehicles", maintenanceVehicles.size());
        summary.put("occupancyRate", calculateOccupancyRate(vehicles.size(), rentedVehicles.size()));

        return summary;
    }

    @Override
    public Vehicle dispatchVehicle(Integer fromStationId, Integer toStationId, Integer vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow();
        Station targetStation = stationRepository.findById(toStationId).orElseThrow();
        Station oldStation = stationRepository.findById(fromStationId).orElseThrow();
        if (!vehicle.getStation().getStationId().equals(fromStationId)) {
            throw new RuntimeException("Vehicle not at source station");
        }

        vehicle.setStation(targetStation);
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        targetStation.setAvailableSlots(targetStation.getAvailableSlots() + 1);
        oldStation.setAvailableSlots(oldStation.getAvailableSlots() - 1);
        userService.logAudit(null, "Dispatched vehicle " + vehicleId + " from station " + fromStationId + " to " + toStationId);
        return updatedVehicle;
    }
    @Override
    public List<Complaint> getComplaintsByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return complaintRepository.findAll();
        }
        ComplaintStatus complaintStatus = ComplaintStatus.fromString(status);
        return complaintRepository.findByStatus(complaintStatus);
    }

    @Override
    public List<User> getStaffByStation(Integer stationId) {
        return userRepository.findAll().stream()
                .filter(user -> "Staff".equals(user.getRole()))
                .filter(user -> user.getStation() != null && user.getStation().getStationId().equals(stationId))
                .toList();
    }

    @Override
    public Map<String, Object> getStaffPerformance(Integer staffId) {
        User staff = userRepository.findById(staffId).orElseThrow();
        List<Booking> handovers = bookingRepository.findByStaffUserId(staffId);

        Map<String, Object> performance = new HashMap<>();
        performance.put("totalHandovers", handovers.size());
        performance.put("station", staff.getStation().getName());
        performance.put("averageRating", calculateAverageRating(staffId)); // Mock calculation
        performance.put("lastActivity", getLastActivity(staffId));

        return performance;
    }


    @Override
    public Map<String, Object> getRevenueReport(Integer stationId, LocalDateTime from, LocalDateTime to) {
        // Validate parameters are LocalDateTime objects
        if (from == null || to == null) {
            throw new RuntimeException("From date and to date are required");
        }

        // Validate date range
        if (from.isAfter(to)) {
            throw new RuntimeException("From date must be before or equal to to date");
        }
        if (from.isAfter(LocalDateTime.now())) {
            throw new RuntimeException("From date cannot be in the future");
        }

        // Only count COMPLETED bookings for revenue
        List<BookingStatus> completedStatuses = List.of(
                com.group7.evr.enums.BookingStatus.COMPLETED
        );

        // Get all COMPLETED bookings (with optional station filter), then filter by date in Java
        List<Booking> allBookings;
        if (stationId != null) {
            // Get bookings for specific station
            allBookings = bookingRepository.findByStationStationIdAndBookingStatusIn(
                    stationId,
                    completedStatuses
            );
        } else {
            // Get all COMPLETED bookings
            allBookings = bookingRepository.findByBookingStatus(BookingStatus.COMPLETED);
        }

        // Filter by date range in Java code to avoid JPA parameter binding issues
        // Convert java.sql.Date to LocalDateTime for comparison
        List<Booking> bookings = allBookings.stream()
                .filter(b -> {
                    java.sql.Date startTimeDate = b.getStartTime();
                    if (startTimeDate == null) return false;
                    // Convert java.sql.Date to LocalDateTime via java.util.Date
                    java.util.Date utilDate = new java.util.Date(startTimeDate.getTime());
                    LocalDateTime startTime = utilDate.toInstant()
                            .atZone(java.time.ZoneId.systemDefault())
                            .toLocalDateTime();
                    return !startTime.isBefore(from) && !startTime.isAfter(to);
                })
                .collect(java.util.stream.Collectors.toList());

        BigDecimal totalRevenue = bookings.stream()
                .filter(b -> b.getTotalPrice() != null)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageRevenue = bookings.isEmpty()
                ? BigDecimal.ZERO
                : totalRevenue.divide(BigDecimal.valueOf(bookings.size()), 2, java.math.RoundingMode.HALF_UP);

        Map<String, Object> report = new HashMap<>();
        report.put("totalRevenue", totalRevenue);
        report.put("totalBookings", bookings.size());
        report.put("averageRevenue", averageRevenue);

        // Calculate top stations by revenue
        if (stationId == null) {
            List<Station> allStations = stationRepository.findAll();
            List<Map<String, Object>> topStations = allStations.stream()
                    .map(station -> {
                        // Get all COMPLETED bookings for this station
                        List<Booking> allStationBookings = bookingRepository.findByStationStationIdAndBookingStatusIn(
                                station.getStationId(),
                                completedStatuses
                        );

                        // Filter by date range in Java code
                        // Convert java.sql.Date to LocalDateTime for comparison
                        List<Booking> stationBookings = allStationBookings.stream()
                                .filter(b -> {
                                    java.sql.Date startTimeDate = b.getStartTime();
                                    if (startTimeDate == null) return false;
                                    // Convert java.sql.Date to LocalDateTime via java.util.Date
                                    java.util.Date utilDate = new java.util.Date(startTimeDate.getTime());
                                    LocalDateTime startTime = utilDate.toInstant()
                                            .atZone(java.time.ZoneId.systemDefault())
                                            .toLocalDateTime();
                                    return !startTime.isBefore(from) && !startTime.isAfter(to);
                                })
                                .collect(java.util.stream.Collectors.toList());

                        BigDecimal stationRevenue = stationBookings.stream()
                                .filter(b -> b.getTotalPrice() != null)
                                .map(Booking::getTotalPrice)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                        BigDecimal stationAvg = stationBookings.isEmpty()
                                ? BigDecimal.ZERO
                                : stationRevenue.divide(BigDecimal.valueOf(stationBookings.size()), 2, java.math.RoundingMode.HALF_UP);

                        Map<String, Object> stationData = new HashMap<>();
                        stationData.put("stationId", station.getStationId());
                        stationData.put("name", station.getName());
                        stationData.put("revenue", stationRevenue);
                        stationData.put("bookings", stationBookings.size());
                        stationData.put("averageRevenue", stationAvg);
                        return stationData;
                    })
                    .filter(s -> ((BigDecimal) s.get("revenue")).compareTo(BigDecimal.ZERO) > 0)
                    .sorted((a, b) -> ((BigDecimal) b.get("revenue")).compareTo((BigDecimal) a.get("revenue")))
                    .limit(5)
                    .toList();
            report.put("topStations", topStations);
        }

        return report;
    }

    @Override
    public Map<String, Object> getUtilizationReport(Integer stationId) {
        List<Vehicle> vehicles = vehicleRepository.findByStationStationIdAndStatus(stationId, VehicleStatus.AVAILABLE);
        List<Vehicle> rentedVehicles = vehicleRepository.findByStationStationIdAndStatus(stationId, VehicleStatus.RENTED);

        Map<String, Object> utilization = new HashMap<>();
        utilization.put("totalVehicles", vehicles.size() + rentedVehicles.size());
        utilization.put("utilizedVehicles", rentedVehicles.size());
        utilization.put("utilizationRate", calculateUtilizationRate(vehicles.size(), rentedVehicles.size()));

        return utilization;
    }

    @Override
    public Map<String, Object> getPeakHoursAnalysis(Integer stationId) {
        List<Booking> bookings = bookingRepository.findByStationStationId(stationId);

        Map<String, Long> hourlyDistribution = bookings.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        booking -> String.valueOf(booking.getStartTime().getHours()),
                        java.util.stream.Collectors.counting()
                ));

        Map<String, Object> analysis = new HashMap<>();
        analysis.put("hourlyDistribution", hourlyDistribution);
        analysis.put("peakHour", findPeakHour(hourlyDistribution));
        analysis.put("totalBookings", bookings.size());

        return analysis;
    }

    // ============ PRIVATE HELPER METHODS ============

    private Double calculateOccupancyRate(int available, int rented) {
        int total = available + rented;
        return total == 0 ? 0.0 : (double) rented / total * 100;
    }

    private Double calculateUtilizationRate(int available, int rented) {
        int total = available + rented;
        return total == 0 ? 0.0 : (double) rented / total * 100;
    }

    private Double calculateAverageRating(Integer staffId) {
        // Mock calculation - would use actual rating system
        return 4.5;
    }

    private LocalDateTime getLastActivity(Integer staffId) {
        // Mock calculation - would get from audit logs
        return LocalDateTime.now().minusHours(2);
    }

    private String findPeakHour(Map<String, Long> hourlyDistribution) {
        return hourlyDistribution.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
    }
}