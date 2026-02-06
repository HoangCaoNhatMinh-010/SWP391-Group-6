package com.group7.evr.service.impl;

import com.group7.evr.entity.Station;
import com.group7.evr.entity.Vehicle;
import com.group7.evr.enums.VehicleStatus;
import com.group7.evr.repository.StationRepository;
import com.group7.evr.repository.VehicleRepository;
import com.group7.evr.service.StationService;
import com.group7.evr.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class StationServiceImpl implements StationService {
    private final StationRepository stationRepository;
    private final VehicleRepository vehicleRepository;
    private final UserService userService;

    @Override
    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }

    @Override
    public List<Station> getNearbyStations(Double lat, Double lng, Double radiusDeg) {
        Double minLat = lat - radiusDeg;
        Double maxLat = lat + radiusDeg;
        Double minLng = lng - radiusDeg;
        Double maxLng = lng + radiusDeg;
        return stationRepository.findByLatitudeBetweenAndLongitudeBetween(minLat, maxLat, minLng, maxLng);
    }

    @Override
    public Station createStation(Station station) {
        // Validate required fields
        if (station.getName() == null || station.getName().trim().isEmpty()) {
            throw new RuntimeException("Station name is required");
        }
        if (station.getAddress() == null || station.getAddress().trim().isEmpty()) {
            throw new RuntimeException("Station address is required");
        }
        
        // Calculate slots based on actual vehicles at station
        // For new stations, slots will be 0 initially
        if (station.getTotalSlots() == null) {
            station.setTotalSlots(0);
        }
        if (station.getAvailableSlots() == null) {
            station.setAvailableSlots(0);
        }
        
        Station savedStation = stationRepository.save(station);
        
        // Recalculate slots after saving (in case vehicles are assigned later)
        recalculateStationSlots(savedStation.getStationId());
        
        userService.logAudit(null, "Created station " + savedStation.getStationId());
        return stationRepository.findById(savedStation.getStationId()).orElse(savedStation);
    }

    @Override
    public Station updateStation(Integer stationId, Station stationUpdates) {
        Station existingStation = stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Station not found"));
        
        // Update allowed fields
        if (stationUpdates.getName() != null) {
            existingStation.setName(stationUpdates.getName());
        }
        if (stationUpdates.getAddress() != null) {
            existingStation.setAddress(stationUpdates.getAddress());
        }
        if (stationUpdates.getContactNumber() != null) {
            existingStation.setContactNumber(stationUpdates.getContactNumber());
        }
        if (stationUpdates.getOperatingHours() != null) {
            existingStation.setOperatingHours(stationUpdates.getOperatingHours());
        }
        // Don't allow manual update of slots - they are calculated automatically
        // if (stationUpdates.getTotalSlots() != null) {
        //     existingStation.setTotalSlots(stationUpdates.getTotalSlots());
        // }
        // if (stationUpdates.getAvailableSlots() != null) {
        //     existingStation.setAvailableSlots(stationUpdates.getAvailableSlots());
        // }
        if (stationUpdates.getLatitude() != null) {
            existingStation.setLatitude(stationUpdates.getLatitude());
        }
        if (stationUpdates.getLongitude() != null) {
            existingStation.setLongitude(stationUpdates.getLongitude());
        }
        
        Station updatedStation = stationRepository.save(existingStation);
        
        // Recalculate slots after update
        recalculateStationSlots(stationId);
        
        userService.logAudit(null, "Updated station " + stationId);
        return stationRepository.findById(stationId).orElse(updatedStation);
    }
    
    @Override
    @Transactional
    public void recalculateStationSlots(Integer stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Station not found"));
        
        List<Vehicle> allVehicles = vehicleRepository.findByStationStationId(stationId);
        int currentVehicleCount = allVehicles.size();
        
        // totalSlots = số xe hiện tại tại trạm (hoặc capacity nếu có set trước)
        // Nếu chưa có totalSlots hoặc totalSlots < số xe hiện tại, set bằng số xe hiện tại
        Integer totalSlots = station.getTotalSlots();
        if (totalSlots == null || totalSlots < currentVehicleCount) {
            totalSlots = currentVehicleCount;
            station.setTotalSlots(totalSlots);
        }
        
        // availableSlots = số slot còn trống để nhận xe mới
        // = totalSlots - số xe hiện tại đang ở trạm
        int availableSlots = Math.max(0, totalSlots - currentVehicleCount);
        station.setAvailableSlots(availableSlots);
        
        stationRepository.save(station);
        log.info("Recalculated slots for station {}: total={}, currentVehicles={}, available={}", 
                stationId, totalSlots, currentVehicleCount, availableSlots);
    }

    @Override
    public Map<String, Object> deleteStation(Integer stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Station not found"));
        
        // Check for active vehicles
        List<Vehicle> stationVehicles = vehicleRepository.findByStationStationId(stationId);
        if (!stationVehicles.isEmpty()) {
            throw new RuntimeException("Cannot delete station with active vehicles. Please transfer vehicles first.");
        }
        
        // Check for active bookings (would need to implement this check)
        // For now, we'll allow deletion but log a warning
        
        stationRepository.delete(station);
        userService.logAudit(null, "Deleted station " + stationId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Station deleted successfully");
        response.put("stationId", stationId);
        return response;
    }
}

