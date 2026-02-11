package com.group7.evr.service.impl;

import com.group7.evr.entity.*;
import com.group7.evr.enums.*;
import com.group7.evr.repository.*;
import com.group7.evr.service.StationStaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class StationStaffServiceImpl implements StationStaffService {
    @Autowired
    private VehicleRepository vehicleRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private ContractRepository contractRepository;
    @Autowired
    private VehicleConditionReportRepository reportRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private ComplaintRepository complaintRepository;
    @Autowired
    private AuditLogRepository auditLogRepository;
    @Autowired
    private MaintenanceRepository maintenanceRepository;

    private final String uploadDir = "uploads/reports/"; // Configure properly (e.g., use S3 in production)

    @Override
    public List<Vehicle> getVehiclesByStatus(Integer staffId, String status) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        Integer stationId = staff.getStation() != null ? staff.getStation().getStationId() : null;
        if (stationId == null) {
            throw new RuntimeException("Staff not assigned to a station");
        }
        if ("Booked".equalsIgnoreCase(status)) {
            // Get vehicles with Pending or Confirmed bookings
            List<Booking> bookings = bookingRepository.findByStationStationIdAndBookingStatusIn(
                    stationId, List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED));
            return bookings.stream()
                    .map(Booking::getVehicle)
                    .distinct()
                    .toList();
        }
        // Map string to enum for repository
        VehicleStatus enumStatus = VehicleStatus.valueOf(status.toUpperCase());
        return vehicleRepository.findByStationStationIdAndStatus(stationId, enumStatus);
    }

    @Override
    public VehicleConditionReport createHandoverReport(Integer staffId, Integer contractId, Integer vehicleId,
                                                       BigDecimal battery, String damageDescription, MultipartFile[] photos,
                                                       String reportType) throws IOException {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Validate staff's station
        if (!vehicle.getStation().getStationId().equals(staff.getStation().getStationId())) {
            throw new RuntimeException("Unauthorized station");
        }

        VehicleConditionReport report = new VehicleConditionReport();
        report.setContract(contract);
        report.setVehicle(vehicle);
        report.setStaff(staff);
        report.setBattery(battery);
        report.setDamageDescription(damageDescription);
        if (photos != null && photos.length > 0) {
            StringBuilder photoUrls = new StringBuilder();
            for (int i = 0; i < photos.length; i++) {
                if (photos[i] != null && !photos[i].isEmpty()) {
                    String fileName = saveFile(photos[i]);
                    if (i > 0) photoUrls.append(",");
                    photoUrls.append(fileName);
                }
            }
            report.setPhotos(photoUrls.toString());
        }
        report.setReportType(ReportType.valueOf(reportType.toUpperCase())); // Convert string to enum
        VehicleConditionReport savedReport = reportRepository.save(report);
        logAudit(staff, "Created " + reportType + " report for contract " + contractId);
        return savedReport;
    }

    @Override
    public Contract signContract(Integer staffId, Integer bookingId, String renterSignature, String staffSignature) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Validate staff's station
        if (!booking.getStation().getStationId().equals(staff.getStation().getStationId())) {
            throw new RuntimeException("Unauthorized station");
        }

        Contract contract = new Contract();
        contract.setBooking(booking);
        contract.setRenterSignature(renterSignature);
        contract.setStaffSignature(staffSignature);
        Contract savedContract = contractRepository.save(contract);
        logAudit(staff, "Signed contract for booking " + bookingId);
        return savedContract;
    }

    @Override
    public User verifyCustomer(Integer staffId, Integer userId) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Logic for verification (e.g., check personalIdImage, licenseImage)
        // Assume verification sets status to Active
        user.setStatus(UserStatus.ACTIVE);
        User updatedUser = userRepository.save(user);
        logAudit(staff, "Verified customer " + userId);
        return updatedUser;
    }

    @Override
    public Payment recordPayment(Integer staffId, Integer bookingId, String method, BigDecimal amount) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Validate staff's station
        if (!booking.getStation().getStationId().equals(staff.getStation().getStationId())) {
            throw new RuntimeException("Unauthorized station");
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setMethod(PaymentMethod.valueOf(method.toUpperCase())); // Convert string to enum
        payment.setAmount(amount);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentDate(LocalDateTime.now());
        Payment savedPayment = paymentRepository.save(payment);
        logAudit(staff, "Recorded payment " + savedPayment.getPaymentId() + " for booking " + bookingId);
        return savedPayment;
    }



    @Override
    public Vehicle updateVehicleStatus(Integer staffId, Integer vehicleId, BigDecimal batteryLevel, BigDecimal mileage, String status) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Validate staff's station
        if (!vehicle.getStation().getStationId().equals(staff.getStation().getStationId())) {
            throw new RuntimeException("Unauthorized station");
        }

        vehicle.setBatteryLevel(batteryLevel);
        vehicle.setMileage(mileage);
        vehicle.setStatus(VehicleStatus.valueOf(status.toUpperCase())); // Convert string to enum
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        logAudit(staff, "Updated vehicle " + vehicleId + " status to " + status);
        return updatedVehicle;
    }

    @Override
    public Complaint reportVehicleIssue(Integer staffId, Integer vehicleId, String issueDescription) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Validate staff's station
        if (!vehicle.getStation().getStationId().equals(staff.getStation().getStationId())) {
            throw new RuntimeException("Unauthorized station");
        }

        Complaint complaint = new Complaint();
        complaint.setContract(null); // No contract for maintenance issues
        complaint.setUser(staff); // Staff reporting
        complaint.setStaff(null);
        complaint.setIssueDescription(issueDescription + " for vehicle " + vehicleId);
        complaint.setStatus(ComplaintStatus.PENDING);
        Complaint savedComplaint = complaintRepository.save(complaint);
        logAudit(staff, "Reported issue for vehicle " + vehicleId);
        return savedComplaint;
    }

    @Override
    public Maintenance createMaintenance(Integer staffId, Integer vehicleId, String issue, LocalDateTime scheduledAt) {
        User staff = userRepository.findById(staffId).orElseThrow();
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow();
        if (!vehicle.getStation().getStationId().equals(staff.getStation().getStationId())) {
            throw new RuntimeException("Unauthorized station");
        }
        Maintenance m = new Maintenance();
        m.setVehicle(vehicle);
        m.setStation(staff.getStation());
        m.setStaff(staff);
        m.setIssueDescription(issue);
        m.setStatus(MaintenanceStatus.OPEN);
        m.setScheduledAt(scheduledAt);
        Maintenance saved = maintenanceRepository.save(m);
        logAudit(staff, "Created maintenance " + saved.getMaintenanceId());
        return saved;
    }

    @Override
    public Maintenance updateMaintenance(Integer staffId, Integer maintenanceId, String status, String remarks) {
        User staff = userRepository.findById(staffId).orElseThrow();
        Maintenance m = maintenanceRepository.findById(maintenanceId).orElseThrow();
        if (!m.getStation().getStationId().equals(staff.getStation().getStationId())) {
            throw new RuntimeException("Unauthorized station");
        }
        m.setStatus(MaintenanceStatus.fromString(status));
        m.setRemarks(remarks);
        if (MaintenanceStatus.CLOSED.equals(m.getStatus())) {
            m.setClosedAt(LocalDateTime.now());
        }
        Maintenance saved = maintenanceRepository.save(m);
        logAudit(staff, "Updated maintenance " + maintenanceId + " to " + status);
        return saved;
    }

    @Override
    public List<Maintenance> listMaintenance(Integer staffId, String status) {
        User staff = userRepository.findById(staffId).orElseThrow();
        if (status != null && !status.trim().isEmpty()) {
            return maintenanceRepository.findByStatus(MaintenanceStatus.fromString(status));
        }
        return maintenanceRepository.findByStationStationId(staff.getStation().getStationId());
    }

    // ============ PRIVATE HELPER METHODS ============

    private String saveFile(MultipartFile file) throws IOException {
        Path path = Paths.get(uploadDir + file.getOriginalFilename());
        Files.write(path, file.getBytes());
        return path.toString();
    }

    private void logAudit(User user, String action) {
        AuditLog log = new AuditLog();
        log.setUser(user);
        log.setAction(action);
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }
}