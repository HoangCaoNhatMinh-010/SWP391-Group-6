package com.group7.evr.service;

import com.group7.evr.entity.Vehicle;
import com.group7.evr.enums.VehicleStatus;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface VehicleService {
    List<Vehicle> getAvailableVehicles(Integer stationId);

    Vehicle getVehicleById(Integer id);

    List<Vehicle> findVehicles(Integer modelId, BigDecimal minBattery);

    Map<String, Object> reportVehicleIssue(Integer vehicleId, Integer userId, String issueCategory,
                                           String priority, String description, MultipartFile[] photos);

    Vehicle createVehicle(Vehicle vehicle);

    Vehicle updateVehicle(Integer vehicleId, Vehicle vehicleUpdates);

    Map<String, Object> deleteVehicle(Integer vehicleId);
    
    Map<String, Object> getAllVehicles(int page, int size, String status);
}
