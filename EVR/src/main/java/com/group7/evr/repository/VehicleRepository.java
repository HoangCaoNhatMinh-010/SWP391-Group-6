package com.group7.evr.repository;

import com.group7.evr.entity.Vehicle;
import com.group7.evr.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle,Integer> {
    List<Vehicle> findByStationStationIdAndStatus(Integer stationId, VehicleStatus status);
    List<Vehicle> findByStationStationId(Integer stationId);
    List<Vehicle> findByModelModelId(Integer modelId);
    List<Vehicle> findByBatteryLevelGreaterThanEqual(BigDecimal minBattery);
}
