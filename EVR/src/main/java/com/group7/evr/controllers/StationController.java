package com.group7.evr.controllers;

import com.group7.evr.entity.Station;
import com.group7.evr.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StationController {
    private final StationService stationService;

    @GetMapping("/stations")
    public ResponseEntity<List<Station>> getStations() {
        return ResponseEntity.ok(stationService.getAllStations());
    }

    // Nearby stations by bounding box around lat/lng with radius (approx using degrees)
    @GetMapping("/stations/nearby")
    public ResponseEntity<List<Station>> getNearby(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "0.02") Double radiusDeg
    ) {
        return ResponseEntity.ok(stationService.getNearbyStations(lat, lng, radiusDeg));
    }

    // Admin: Station CRUD operations
    @PostMapping("/stations")
    public ResponseEntity<Station> createStation(@RequestBody Station station) {
        return ResponseEntity.ok(stationService.createStation(station));
    }

    @PutMapping("/stations/{id}")
    public ResponseEntity<Station> updateStation(@PathVariable Integer id, @RequestBody Station stationUpdates) {
        return ResponseEntity.ok(stationService.updateStation(id, stationUpdates));
    }

    @DeleteMapping("/stations/{id}")
    public ResponseEntity<Map<String, Object>> deleteStation(@PathVariable Integer id) {
        return ResponseEntity.ok(stationService.deleteStation(id));
    }
}

