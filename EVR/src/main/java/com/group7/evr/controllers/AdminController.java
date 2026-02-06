package com.group7.evr.controllers;

import com.group7.evr.entity.*;
import com.group7.evr.enums.ComplaintStatus;
import com.group7.evr.service.AdminService;
import com.group7.evr.service.ComplaintService;
import com.group7.evr.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final ComplaintService complaintService;
    private final UserService userService;

    // Fleet monitoring
    @GetMapping("/fleet/summary")
    public ResponseEntity<Map<String, Object>> getFleetSummary(@RequestParam(required = false) Integer stationId) {
        if (stationId == null) {
            // Return overall fleet summary
            return ResponseEntity.ok(adminService.getFleetSummary(1)); // Mock for overall
        }
        return ResponseEntity.ok(adminService.getFleetSummary(stationId));
    }

    @PostMapping("/fleet/dispatch")
    public ResponseEntity<Vehicle> dispatchVehicle(
            @RequestParam Integer fromStationId,
            @RequestParam Integer toStationId,
            @RequestParam Integer vehicleId) {
        return ResponseEntity.ok(adminService.dispatchVehicle(fromStationId, toStationId, vehicleId));
    }

    // Customer management
    @GetMapping("/customers")
    public ResponseEntity<List<User>> getCustomers() {
        return ResponseEntity.ok(adminService.getCustomersWithRiskFlags());
    }

    @PostMapping("/customers/{id}/flag")
    public ResponseEntity<RiskFlag> flagCustomer(
            @PathVariable Integer id,
            @RequestParam Integer adminId,
            @RequestParam String reason,
            @RequestParam Integer riskScore) {
        return ResponseEntity.ok(adminService.flagCustomer(id, adminId, reason, riskScore));
    }

    @PutMapping("/customers/{id}/status")
    public ResponseEntity<User> updateCustomerStatus(
            @PathVariable Integer id,
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(userService.updateUserStatus(id, status, reason));
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getComplaints(@RequestParam(required = false) String status) {
        if (status == null) {
            return ResponseEntity.ok(adminService.getComplaintsByStatus("Pending"));
        }
        return ResponseEntity.ok(adminService.getComplaintsByStatus(status));
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<Complaint> getComplaintById(@PathVariable Integer id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    @PutMapping("/complaints/{id}/respond")
    public ResponseEntity<Complaint> respondToComplaint(
            @PathVariable Integer id,
            @RequestParam Integer adminId,
            @RequestParam String response,
            @RequestParam String status) {
        User admin = userService.getUserById(adminId);
        ComplaintStatus complaintStatus = ComplaintStatus.fromString(status);
        return ResponseEntity.ok(complaintService.respondToComplaint(id, response, complaintStatus, admin));
    }

    // Staff management
    @GetMapping("/staff")
    public ResponseEntity<List<User>> getStaff(@RequestParam(required = false) Integer stationId) {
        if (stationId == null) {
            return ResponseEntity.ok(adminService.getStaffByStation(1)); // Mock for all
        }
        return ResponseEntity.ok(adminService.getStaffByStation(stationId));
    }

    @GetMapping("/staff/{id}/performance")
    public ResponseEntity<Map<String, Object>> getStaffPerformance(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getStaffPerformance(id));
    }

    @PostMapping("/staff/schedule")
    public ResponseEntity<StaffSchedule> createStaffSchedule(
            @RequestParam Integer staffId,
            @RequestParam Integer stationId,
            @RequestParam String shiftStart,
            @RequestParam String shiftEnd,
            @RequestParam String shiftType) {
        LocalDateTime start = LocalDateTime.parse(shiftStart);
        LocalDateTime end = LocalDateTime.parse(shiftEnd);
        return ResponseEntity.ok(adminService.createStaffSchedule(staffId, stationId, start, end, shiftType));
    }

    // Reports and analytics
    @GetMapping("/reports/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport(
            @RequestParam(required = false) Integer stationId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        // Validate required parameters
        if (from == null || from.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "From date is required",
                "message", "Vui lòng chọn ngày bắt đầu"
            ));
        }
        if (to == null || to.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "To date is required",
                "message", "Vui lòng chọn ngày kết thúc"
            ));
        }
        
        try {
            // Parse datetime with flexible format (with or without seconds)
            LocalDateTime fromDate;
            LocalDateTime toDate;
            
            // Try format without seconds first (datetime-local format), then with seconds
            java.time.format.DateTimeFormatter formatterWithoutSeconds = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
            
            // Parse from date
            try {
                // Try format without seconds first (most common from datetime-local input)
                fromDate = LocalDateTime.parse(from, formatterWithoutSeconds);
            } catch (java.time.format.DateTimeParseException e) {
                // If that fails, try ISO format with seconds
                try {
                    fromDate = LocalDateTime.parse(from);
                } catch (java.time.format.DateTimeParseException e2) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid date format",
                        "message", "Định dạng ngày bắt đầu không hợp lệ: " + from + ". Vui lòng sử dụng định dạng: yyyy-MM-ddTHH:mm"
                    ));
                }
            }
            
            // Parse to date
            try {
                // Try format without seconds first (most common from datetime-local input)
                toDate = LocalDateTime.parse(to, formatterWithoutSeconds);
            } catch (java.time.format.DateTimeParseException e) {
                // If that fails, try ISO format with seconds
                try {
                    toDate = LocalDateTime.parse(to);
                } catch (java.time.format.DateTimeParseException e2) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid date format",
                        "message", "Định dạng ngày kết thúc không hợp lệ: " + to + ". Vui lòng sử dụng định dạng: yyyy-MM-ddTHH:mm"
                    ));
                }
            }
            
            // Validate date range
            if (fromDate.isAfter(toDate)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid date range",
                    "message", "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc"
                ));
            }
            
            // Validate dates are not too far in the future
            LocalDateTime now = LocalDateTime.now();
            if (fromDate.isAfter(now) || toDate.isAfter(now.plusDays(1))) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid date range",
                    "message", "Ngày không được vượt quá hiện tại"
                ));
            }
            
            return ResponseEntity.ok(adminService.getRevenueReport(stationId, fromDate, toDate));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid date format",
                "message", "Định dạng ngày không hợp lệ: " + e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid date format",
                "message", "Định dạng ngày không hợp lệ: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/reports/utilization")
    public ResponseEntity<Map<String, Object>> getUtilizationReport(@RequestParam(required = false) Integer stationId) {
        if (stationId == null) {
            stationId = 1; // Default station
        }
        return ResponseEntity.ok(adminService.getUtilizationReport(stationId));
    }

    @GetMapping("/reports/peaks")
    public ResponseEntity<Map<String, Object>> getPeakHoursAnalysis(@RequestParam(required = false) Integer stationId) {
        if (stationId == null) {
            stationId = 1; // Default station
        }
        return ResponseEntity.ok(adminService.getPeakHoursAnalysis(stationId));
    }

    // AI demand forecasting (placeholder)
    @GetMapping("/reports/forecast")
    public ResponseEntity<Map<String, Object>> getDemandForecast(@RequestParam(required = false) Integer stationId) {
        Map<String, Object> forecast = new java.util.HashMap<>();
        forecast.put("predictedDemand", 85); // Mock AI prediction
        forecast.put("confidence", 0.78);
        forecast.put("recommendedActions", List.of("Increase fleet by 2 vehicles", "Schedule additional staff"));
        return ResponseEntity.ok(forecast);
    }
}
