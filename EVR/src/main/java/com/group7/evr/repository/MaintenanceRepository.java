package com.group7.evr.repository;

import com.group7.evr.entity.Maintenance;
import com.group7.evr.enums.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Integer> {
    List<Maintenance> findByStationStationId(Integer stationId);
    List<Maintenance> findByVehicleVehicleId(Integer vehicleId);
    List<Maintenance> findByStatus(MaintenanceStatus status);
}
