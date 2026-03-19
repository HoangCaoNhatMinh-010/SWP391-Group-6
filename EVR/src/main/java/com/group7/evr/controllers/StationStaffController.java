package com.group7.evr.controllers;

import com.group7.evr.entity.Maintenance;
import com.group7.evr.entity.VehicleConditionReport;
import com.group7.evr.service.impl.StationStaffServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StationStaffController {
    private final StationStaffServiceImpl stationStaffService;

    @PostMapping("/handover")
    public ResponseEntity<VehicleConditionReport> createHandover(
            @RequestParam Integer staffId,
            @RequestParam Integer contractId,
            @RequestParam Integer vehicleId,
            @RequestParam BigDecimal battery,
            @RequestParam(required = false) String damageDescription,
            @RequestParam(required = false) MultipartFile[] photos,
            @RequestParam String reportType
    ) throws Exception {
        return ResponseEntity.ok(
                stationStaffService.createHandoverReport(staffId, contractId, vehicleId, battery, damageDescription, photos, reportType)
        );
    }

    @PostMapping("/maintenance")
    public ResponseEntity<Maintenance> createMaintenance(
            @RequestParam Integer staffId,
            @RequestParam Integer vehicleId,
            @RequestParam String issue,
            @RequestParam(required = false) String scheduledAt
    ) {
        LocalDateTime schedule = scheduledAt == null ? null : LocalDateTime.parse(scheduledAt);
        return ResponseEntity.ok(
                stationStaffService.createMaintenance(staffId, vehicleId, issue, schedule)
        );
    }

    @PutMapping("/maintenance/{id}")
    public ResponseEntity<Maintenance> updateMaintenance(
            @PathVariable Integer id,
            @RequestParam Integer staffId,
            @RequestParam String status,
            @RequestParam(required = false) String remarks
    ) {
        return ResponseEntity.ok(
                stationStaffService.updateMaintenance(staffId, id, status, remarks)
        );
    }

    @GetMapping("/maintenance")
    public ResponseEntity<List<Maintenance>> listMaintenance(
            @RequestParam Integer staffId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(
                stationStaffService.listMaintenance(staffId, status)
        );
    }
}
