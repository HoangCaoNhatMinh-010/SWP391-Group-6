package com.group7.evr.service.impl;

import com.group7.evr.entity.*;
import com.group7.evr.enums.BookingStatus;
import com.group7.evr.enums.UserRole;
import com.group7.evr.enums.VehicleStatus;
import com.group7.evr.repository.BookingRepository;
import com.group7.evr.repository.ContractRepository;
import com.group7.evr.repository.VehicleRepository;
import com.group7.evr.repository.StationRepository;
import com.group7.evr.service.BookingService;
import com.group7.evr.service.EmailService;
import com.group7.evr.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserService userService;
    private final StationRepository stationRepository;
    private final EmailService emailService;
    private final ContractRepository contractRepository;

    @Override
    public Booking createBooking(Booking booking, User user) {
        Vehicle vehicle = vehicleRepository.findById(booking.getVehicle().getVehicleId()).orElseThrow();
        Station vehicleStation = vehicle.getStation();
        Station requestStation = booking.getStation();
        if (vehicleStation == null && (requestStation == null || requestStation.getStationId() == null)) {
            throw new RuntimeException("Vehicle is not assigned to any station");
        }
        if (vehicleStation != null && requestStation != null
                && requestStation.getStationId() != null
                && !vehicleStation.getStationId().equals(requestStation.getStationId())) {
            throw new RuntimeException("Vehicle does not belong to the selected station");
        }
        Station resolvedStation = vehicleStation != null ? vehicleStation : requestStation;
        booking.setStation(resolvedStation);
        
        // Enhanced validation
        if (!VehicleStatus.AVAILABLE.equals(vehicle.getStatus())) {
            throw new RuntimeException("Vehicle not available");
        }
        
        // Check for time conflicts
        if (hasTimeConflict(booking)) {
            throw new RuntimeException("Booking time conflicts with existing booking");
        }
        
        // Validate booking dates
        if (booking.getStartTime() != null && booking.getEndTime() != null) {
            if (booking.getStartTime().after(booking.getEndTime())) {
                throw new RuntimeException("Start time cannot be after end time");
            }
        }
        
        vehicle.setStatus(VehicleStatus.RENTED);
        vehicleRepository.save(vehicle);
        booking.setUser(user);
        Integer stationId = booking.getStation() != null ? booking.getStation().getStationId() : null;
        if (stationId != null) {
            booking.setStaff(userService.getPrimaryStaffForStation(stationId));
        }
        booking.setBookingStatus(BookingStatus.PENDING);
        Booking savedBooking = bookingRepository.save(booking);
        userService.logAudit(user, "Created booking " + savedBooking.getBookingId());
        emailService.sendBookingConfirmation(savedBooking);
        return savedBooking;
    }

    @Override
    public Booking getBookingById(Integer bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    @Override
    public Map<String, Object> getUserBookingsWithFilters(Integer userId, String status, String fromDate, String toDate, int page, int size) {
        List<Booking> allBookings = bookingRepository.findByUserUserId(userId);
        
        // Apply filters
        BookingStatus statusEnum = status != null ? BookingStatus.fromString(status) : null;

        List<Booking> filteredBookings = allBookings.stream()
                .filter(booking -> statusEnum == null || booking.getBookingStatus() == statusEnum)
                .filter(booking -> fromDate == null || booking.getStartTime().toString().compareTo(fromDate) >= 0)
                .filter(booking -> toDate == null || booking.getStartTime().toString().compareTo(toDate) <= 0)
                .toList();
        
        // Apply pagination
        int start = page * size;
        int end = Math.min(start + size, filteredBookings.size());
        List<Booking> paginatedBookings = filteredBookings.subList(start, end);
        
        Map<String, Object> response = new HashMap<>();
        response.put("bookings", paginatedBookings);
        response.put("totalCount", filteredBookings.size());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", (int) Math.ceil((double) filteredBookings.size() / size));
        
        return response;
    }

    private boolean hasTimeConflict(Booking newBooking) {
        List<Booking> existingBookings = bookingRepository.findByVehicleVehicleId(newBooking.getVehicle().getVehicleId());
        
        return existingBookings.stream()
                .filter(booking -> !BookingStatus.CANCELLED.equals(booking.getBookingStatus()) && !BookingStatus.COMPLETED.equals(booking.getBookingStatus()))
                .anyMatch(booking -> {
                    // Simple time overlap check
                    return (newBooking.getStartTime().before(booking.getEndTime()) && 
                           newBooking.getEndTime().after(booking.getStartTime()));
                });
    }

    @Override
    public Booking checkIn(Integer bookingId, User user, User staff) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        BookingStatus currentStatus = booking.getBookingStatus();
        if (BookingStatus.CONFIRMED.equals(currentStatus)) {
            return booking;
        }
        if (BookingStatus.COMPLETED.equals(currentStatus) || BookingStatus.CANCELLED.equals(currentStatus)) {
            throw new RuntimeException("Booking cannot be checked in with status " + currentStatus);
        }
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        booking.setStaff(staff);
        Station station = booking.getStation();
        if (station != null) {
            Integer availableSlots = station.getAvailableSlots();
            int currentAvailable = availableSlots != null ? availableSlots : 0;
            if (currentAvailable <= 0) {
                throw new RuntimeException("No available slots remaining at station " + station.getStationId());
            }
            station.setAvailableSlots(currentAvailable - 1);
            stationRepository.save(station);
        }
        // Create contract, report, etc.
        userService.logAudit(user, "Checked in booking " + bookingId);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking returnVehicle(Integer bookingId, User user, User staff, Double batteryLevel) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        BookingStatus currentStatus = booking.getBookingStatus();
        if (BookingStatus.COMPLETED.equals(currentStatus)) {
            return booking;
        }
        if (!BookingStatus.CONFIRMED.equals(currentStatus)) {
            throw new RuntimeException("Only confirmed bookings can be returned");
        }
        booking.setBookingStatus(BookingStatus.COMPLETED);
        Vehicle vehicle = booking.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        
        // Update battery level if provided
        if (batteryLevel != null) {
            if (batteryLevel < 0 || batteryLevel > 100) {
                throw new RuntimeException("Battery level must be between 0 and 100");
            }
            vehicle.setBatteryLevel(java.math.BigDecimal.valueOf(batteryLevel));
        }
        
        vehicleRepository.save(vehicle);
        Station station = booking.getStation();
        if (station != null) {
            Integer availableSlots = station.getAvailableSlots();
            Integer totalSlots = station.getTotalSlots();
            int currentAvailable = availableSlots != null ? availableSlots : 0;
            int nextAvailable = currentAvailable + 1;
            if (totalSlots != null && nextAvailable > totalSlots) {
                nextAvailable = totalSlots;
            }
            station.setAvailableSlots(nextAvailable);
            stationRepository.save(station);
        }
        userService.logAudit(user, "Returned vehicle for booking " + bookingId + (batteryLevel != null ? " with battery level " + batteryLevel + "%" : ""));
        return bookingRepository.save(booking);
    }

    @Override
    public List<Booking> getUserHistory(Integer userId) {
        return bookingRepository.findByUserUserId(userId);
    }

    @Override
    public List<Booking> getCheckInQueue(Integer staffId) {
        return getBookingsForStaff(staffId, List.of(BookingStatus.PENDING, BookingStatus.DENIED));
    }

    @Override
    public List<Booking> getReturnQueue(Integer staffId) {
        return getBookingsForStaff(staffId, List.of(BookingStatus.CONFIRMED));
    }

    @Override
    public List<Booking> getStaffContracts(Integer staffId) {
        User staff = userService.getUserById(staffId);
        if (!UserRole.STAFF.equals(staff.getRole())) {
            throw new RuntimeException("User is not a staff member");
        }
        if (staff.getStation() == null || staff.getStation().getStationId() == null) {
            throw new RuntimeException("Staff is not assigned to a station");
        }
        // Get all bookings for the staff's station (all statuses except cancelled)
        return bookingRepository.findByStationStationId(staff.getStation().getStationId())
                .stream()
                .filter(booking -> !BookingStatus.CANCELLED.equals(booking.getBookingStatus()))
                .collect(java.util.stream.Collectors.toList());
    }

    private List<Booking> getBookingsForStaff(Integer staffId, List<BookingStatus> statuses) {
        User staff = userService.getUserById(staffId);
        if (!UserRole.STAFF.equals(staff.getRole())) {
            throw new RuntimeException("User is not a staff member");
        }
        if (staff.getStation() == null || staff.getStation().getStationId() == null) {
            throw new RuntimeException("Staff is not assigned to a station");
        }

        if (statuses == null || statuses.isEmpty()) {
            statuses = Arrays.asList(BookingStatus.values());
        }
        return bookingRepository.findByStationStationIdAndBookingStatusIn(
                staff.getStation().getStationId(),
                statuses
        );
    }

    @Override
    public Map<String, Object> getUserAnalytics(Integer userId) {
        List<Booking> bookings = getUserHistory(userId);
        BigDecimal totalCost = bookings.stream().map(Booking::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
        long count = bookings.size();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", count);
        stats.put("totalCost", totalCost);
        return stats;
    }

    @Override
    public Map<String, Object> getAdvancedUserAnalytics(Integer userId) {
        List<Booking> bookings = getUserHistory(userId);
        
        // Peak/Off-peak analysis
        Map<String, Long> peakHours = bookings.stream()
                .collect(Collectors.groupingBy(
                    booking -> {
                        LocalTime startTime = booking.getStartTime().toLocalDate().atStartOfDay().toLocalTime();
                        int hour = startTime.getHour();
                        return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? "Peak" : "Off-Peak";
                    },
                    Collectors.counting()
                ));
        
        // Distance analysis (mock - would need actual distance calculation)
        BigDecimal totalDistance = bookings.stream()
                .map(booking -> booking.getVehicle().getMileage() != null ? booking.getVehicle().getMileage() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Spending categories
        Map<String, BigDecimal> spendingCategories = new HashMap<>();
        spendingCategories.put("rental", bookings.stream()
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        spendingCategories.put("fees", BigDecimal.ZERO); // Would calculate from actual fees
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("peakHours", peakHours);
        analytics.put("totalDistance", totalDistance);
        analytics.put("spendingCategories", spendingCategories);
        analytics.put("totalBookings", bookings.size());
        
        return analytics;
    }

    @Override
    public Booking modifyBooking(Integer bookingId, Booking updates, User actor) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        if (BookingStatus.COMPLETED.equals(booking.getBookingStatus()) || BookingStatus.CANCELLED.equals(booking.getBookingStatus())) {
            throw new RuntimeException("Booking cannot be modified in current status");
        }
        if (updates.getStartTime() != null) booking.setStartTime(updates.getStartTime());
        if (updates.getEndTime() != null) booking.setEndTime(updates.getEndTime());
        if (updates.getVehicle() != null && updates.getVehicle().getVehicleId() != null
        && !updates.getVehicle().getVehicleId().equals(booking.getVehicle().getVehicleId())) {
            Vehicle current = booking.getVehicle();
            current.setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(current);
            Vehicle next = vehicleRepository.findById(updates.getVehicle().getVehicleId()).orElseThrow();
            if (!VehicleStatus.AVAILABLE.equals(next.getStatus())) {
                throw new RuntimeException("New vehicle is not available");
            }
            next.setStatus(VehicleStatus.RENTED);
            vehicleRepository.save(next);
            booking.setVehicle(next);
        }
        userService.logAudit(actor, "Modified booking " + bookingId);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking cancelBooking(Integer bookingId, User actor) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        if (BookingStatus.COMPLETED.equals(booking.getBookingStatus()) || BookingStatus.CANCELLED.equals(booking.getBookingStatus())) {
            return booking; // idempotent
        }
        booking.setBookingStatus(BookingStatus.CANCELLED);
        Vehicle vehicle = booking.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(vehicle);
        userService.logAudit(actor, "Cancelled booking " + bookingId);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking denyBooking(Integer bookingId, User staff, String reason) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        BookingStatus currentStatus = booking.getBookingStatus();
        
        if (BookingStatus.COMPLETED.equals(currentStatus) || BookingStatus.CANCELLED.equals(currentStatus) 
                || BookingStatus.DENIED.equals(currentStatus) || BookingStatus.CONFIRMED.equals(currentStatus)) {
            throw new RuntimeException("Booking cannot be denied in current status: " + currentStatus);
        }
        
        // Verify staff has permission (staff should be assigned to the station)
        if (staff.getStation() == null || booking.getStation() == null 
                || !staff.getStation().getStationId().equals(booking.getStation().getStationId())) {
            throw new RuntimeException("Staff is not authorized to deny this booking");
        }
        
        booking.setBookingStatus(BookingStatus.DENIED);
        booking.setStaff(staff);
        
        // Release the vehicle back to available
        Vehicle vehicle = booking.getVehicle();
        if (vehicle != null) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(vehicle);
        }
        
        userService.logAudit(staff, "Denied booking " + bookingId + (reason != null ? ": " + reason : ""));
        Booking savedBooking = bookingRepository.save(booking);
        
        // Send denial notification email
        emailService.sendBookingDenial(savedBooking, reason);
        
        return savedBooking;
    }

    @Override
    public Map<String, Object> getStaffContractsWithDetails(Integer staffId) {
        List<Booking> bookings = getStaffContracts(staffId);

        // Load contracts for each booking
        List<Map<String, Object>> contractsData = new ArrayList<>();
        for (Booking booking : bookings) {
            Map<String, Object> bookingData = new HashMap<>();
            bookingData.put("booking", booking);

            // Find contract for this booking
            contractRepository.findByBookingBookingId(booking.getBookingId())
                    .ifPresent(contract -> {
                        Map<String, Object> contractData = new HashMap<>();
                        contractData.put("contractId", contract.getContractId());
                        contractData.put("renterSignature", contract.getRenterSignature());
                        contractData.put("staffSignature", contract.getStaffSignature());
                        contractData.put("signedAt", contract.getSignedAt());
                        contractData.put("status", contract.getStatus() != null ? contract.getStatus().toString() : null);
                        bookingData.put("contract", contractData);
                    });

            contractsData.add(bookingData);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("contracts", contractsData);
        return response;
    }

    @Override
    public Map<String, Object> settleBooking(Integer bookingId, User actor) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        
        BigDecimal basePrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
        BigDecimal lateFee = calculateLateFee(booking);
        BigDecimal damageFee = calculateDamageFee(booking);
        BigDecimal energyFee = calculateEnergyFee(booking);
        
        BigDecimal extraFees = lateFee.add(damageFee).add(energyFee);
        BigDecimal total = basePrice.add(extraFees);
        
        Map<String, Object> settlement = new HashMap<>();
        settlement.put("basePrice", basePrice);
        settlement.put("lateFee", lateFee);
        settlement.put("damageFee", damageFee);
        settlement.put("energyFee", energyFee);
        settlement.put("extraFees", extraFees);
        settlement.put("total", total);
        
        userService.logAudit(actor, "Settled booking " + bookingId + " with total: " + total);
        return settlement;
    }
    
    private BigDecimal calculateLateFee(Booking booking) {
        // Mock calculation - would use actual time differences
        return BigDecimal.ZERO;
    }
    
    private BigDecimal calculateDamageFee(Booking booking) {
        // Mock calculation - would check vehicle condition reports
        return BigDecimal.ZERO;
    }
    
    private BigDecimal calculateEnergyFee(Booking booking) {
        // Mock calculation - would check battery usage
        return BigDecimal.ZERO;
    }
}

