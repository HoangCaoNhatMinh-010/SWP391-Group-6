package com.group7.evr.service.impl;

import com.group7.evr.entity.*;
import com.group7.evr.enums.*;
import com.group7.evr.repository.*;
import com.group7.evr.service.StationService;
import com.group7.evr.service.UserService;
import com.group7.evr.service.VehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleServiceImpl implements VehicleService {
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final IssueReportRepository issueReportRepository;
    private final UserService userService;
    private final StationService stationService;
    
    private final String uploadDir = "uploads/issues/";

    @Override
    public List<Vehicle> getAvailableVehicles(Integer stationId) {
        return vehicleRepository.findByStationStationIdAndStatus(stationId, VehicleStatus.AVAILABLE);
    }

    @Override
    public Vehicle getVehicleById(Integer id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    @Override
    public List<Vehicle> findVehicles(Integer modelId, BigDecimal minBattery) {
        if (modelId != null) {
            return vehicleRepository.findByModelModelId(modelId);
        }
        if (minBattery != null) {
            return vehicleRepository.findByBatteryLevelGreaterThanEqual(minBattery);
        }
        return vehicleRepository.findAll();
    }

    @Override
    public Map<String, Object> reportVehicleIssue(Integer vehicleId, Integer userId, String issueCategory,
                                                   String priority, String description, MultipartFile[] photos) {
        // Validate vehicle exists
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate issue category
        IssueCategory categoryEnum;
        try {
            categoryEnum = IssueCategory.valueOf(issueCategory.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid issue category. Must be: mechanical, electrical, cosmetic, safety");
        }
        
        // Validate priority
        IssuePriority priorityEnum;
        try {
            priorityEnum = IssuePriority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid priority. Must be: low, medium, high, critical");
        }
        
        // Create issue report
        IssueReport issueReport = new IssueReport();
        issueReport.setVehicle(vehicle);
        issueReport.setReportedBy(user);
        issueReport.setStation(vehicle.getStation());
        issueReport.setIssueCategory(categoryEnum);
        issueReport.setPriority(priorityEnum);
        issueReport.setDescription(description);
        issueReport.setStatus(IssueStatus.OPEN);
        
        // Handle photo uploads
        if (photos != null && photos.length > 0) {
            StringBuilder photoUrls = new StringBuilder();
            for (int i = 0; i < photos.length; i++) {
                if (photos[i] != null && !photos[i].isEmpty()) {
                    try {
                        String fileName = saveFile(photos[i]);
                        if (i > 0) photoUrls.append(",");
                        photoUrls.append(fileName);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to save photo: " + e.getMessage());
                    }
                }
            }
            issueReport.setPhotos(photoUrls.toString());
        }
        
        // Save issue report
        IssueReport savedReport = issueReportRepository.save(issueReport);
        
        // Log audit
        userService.logAudit(user, "Reported vehicle issue " + savedReport.getIssueReportId() + " for vehicle " + vehicleId);
        
        // Notify station staff (mock implementation)
        notifyStationStaff(vehicle.getStation(), savedReport);
        
        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("issueReportId", savedReport.getIssueReportId());
        response.put("status", "Issue reported successfully");
        response.put("priority", priority);
        response.put("category", issueCategory);
        response.put("reportedAt", savedReport.getReportedAt());
        response.put("message", "Issue has been reported and station staff will be notified");
        
        return response;
    }
    
    private String saveFile(MultipartFile file) throws IOException {
        Path path = Paths.get(uploadDir + file.getOriginalFilename());
        Files.write(path, file.getBytes());
        return path.toString();
    }
    
    private void notifyStationStaff(Station station, IssueReport issueReport) {
        // Mock notification - in production, this would send email/SMS to station staff
        System.out.println("NOTIFICATION: New issue reported for vehicle " + issueReport.getVehicle().getVehicleId() + 
                          " at station " + station.getName() + 
                          " - Priority: " + issueReport.getPriority() + 
                          " - Category: " + issueReport.getIssueCategory());
        
        // Log notification attempt
        userService.logAudit(null, "Notification sent to station staff for issue " + issueReport.getIssueReportId());
    }

    @Override
    public Vehicle createVehicle(Vehicle vehicle) {
        // Validate required fields
        if (vehicle.getPlateNumber() == null || vehicle.getPlateNumber().trim().isEmpty()) {
            throw new RuntimeException("Plate number is required");
        }
        
        // Check for duplicate plate number
        if (vehicleRepository.findAll().stream()
                .anyMatch(v -> v.getPlateNumber().equals(vehicle.getPlateNumber()))) {
            throw new RuntimeException("Vehicle with this plate number already exists");
        }
        
        // Set default values
        if (vehicle.getStatus() == null) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }
        if (vehicle.getBatteryLevel() == null) {
            vehicle.setBatteryLevel(BigDecimal.valueOf(100));
        }
        if (vehicle.getMileage() == null) {
            vehicle.setMileage(BigDecimal.ZERO);
        }
        
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        
        // Recalculate slots for the station if vehicle has a station
        if (savedVehicle.getStation() != null && savedVehicle.getStation().getStationId() != null) {
            stationService.recalculateStationSlots(savedVehicle.getStation().getStationId());
        }
        
        userService.logAudit(null, "Created vehicle " + savedVehicle.getVehicleId());
        return savedVehicle;
    }

    @Override
    public Vehicle updateVehicle(Integer vehicleId, Vehicle vehicleUpdates) {
        Vehicle existingVehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        // Update allowed fields
        if (vehicleUpdates.getPlateNumber() != null) {
            // Check for duplicate plate number (excluding current vehicle)
            if (vehicleRepository.findAll().stream()
                    .anyMatch(v -> !v.getVehicleId().equals(vehicleId) && v.getPlateNumber().equals(vehicleUpdates.getPlateNumber()))) {
                throw new RuntimeException("Vehicle with this plate number already exists");
            }
            existingVehicle.setPlateNumber(vehicleUpdates.getPlateNumber());
        }
        if (vehicleUpdates.getBatteryLevel() != null) {
            existingVehicle.setBatteryLevel(vehicleUpdates.getBatteryLevel());
        }
        if (vehicleUpdates.getMileage() != null) {
            existingVehicle.setMileage(vehicleUpdates.getMileage());
        }
        if (vehicleUpdates.getStatus() != null) {
            existingVehicle.setStatus(vehicleUpdates.getStatus());
        }
        if (vehicleUpdates.getLastMaintenanceDate() != null) {
            existingVehicle.setLastMaintenanceDate(vehicleUpdates.getLastMaintenanceDate());
        }
        
        Integer oldStationId = existingVehicle.getStation() != null ? existingVehicle.getStation().getStationId() : null;
        
        Vehicle updatedVehicle = vehicleRepository.save(existingVehicle);
        
        // Recalculate slots for both old and new stations if station changed
        Integer newStationId = updatedVehicle.getStation() != null ? updatedVehicle.getStation().getStationId() : null;
        if (oldStationId != null && !oldStationId.equals(newStationId)) {
            stationService.recalculateStationSlots(oldStationId);
        }
        if (newStationId != null) {
            stationService.recalculateStationSlots(newStationId);
        }
        
        userService.logAudit(null, "Updated vehicle " + vehicleId);
        return updatedVehicle;
    }

    @Override
    public Map<String, Object> deleteVehicle(Integer vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        // Check for active bookings
        // Note: This would need to be implemented with proper booking status checks
        if (!VehicleStatus.AVAILABLE.equals(vehicle.getStatus())) {
            throw new RuntimeException("Cannot delete vehicle with active bookings or maintenance");
        }
        
        Integer stationId = vehicle.getStation() != null ? vehicle.getStation().getStationId() : null;
        
        // Soft delete by setting status to 'Maintenance' (since we don't have a DELETED status)
        vehicle.setStatus(VehicleStatus.MAINTENANCE);
        vehicleRepository.save(vehicle);
        
        // Recalculate slots for the station
        if (stationId != null) {
            stationService.recalculateStationSlots(stationId);
        }
        
        userService.logAudit(null, "Deleted vehicle " + vehicleId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Vehicle deleted successfully");
        response.put("vehicleId", vehicleId);
        return response;
    }

    @Override
    public Map<String, Object> getAllVehicles(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("vehicleId").descending());
        Page<Vehicle> vehiclePage;

        if (status != null && !status.isEmpty()) {
            try {
                VehicleStatus vehicleStatus = VehicleStatus.valueOf(status.toUpperCase());
                // Get all vehicles and filter by status, then paginate manually
                List<Vehicle> allVehicles = vehicleRepository.findAll();
                List<Vehicle> filtered = allVehicles.stream()
                    .filter(v -> v.getStatus() == vehicleStatus)
                    .toList();
                int start = page * size;
                int end = Math.min(start + size, filtered.size());
                List<Vehicle> pagedVehicles = start < filtered.size() 
                    ? filtered.subList(start, end) 
                    : List.of();
                
                Map<String, Object> response = new HashMap<>();
                response.put("vehicles", pagedVehicles);
                response.put("currentPage", page);
                response.put("totalItems", filtered.size());
                response.put("totalPages", (int) Math.ceil((double) filtered.size() / size));
                return response;
            } catch (IllegalArgumentException e) {
                // Invalid status, return all
            }
        }
        
        vehiclePage = vehicleRepository.findAll(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("vehicles", vehiclePage.getContent());
        response.put("currentPage", vehiclePage.getNumber());
        response.put("totalItems", vehiclePage.getTotalElements());
        response.put("totalPages", vehiclePage.getTotalPages());
        return response;
    }
}

