package com.group7.evr.service;

import com.group7.evr.entity.Complaint;
import com.group7.evr.entity.User;
import com.group7.evr.entity.Vehicle;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface AdminService {

    public Map<String, Object> getFleetSummary(Integer stationId);

    public Vehicle dispatchVehicle(Integer fromStationId, Integer toStationId, Integer vehicleId);

    public List<Complaint> getComplaintsByStatus(String status);

    public List<User> getStaffByStation(Integer stationId);

    public Map<String, Object> getStaffPerformance(Integer staffId);

    public Map<String, Object> getRevenueReport(Integer stationId, LocalDateTime from, LocalDateTime to);

    public Map<String, Object> getUtilizationReport(Integer stationId);

    public Map<String, Object> getPeakHoursAnalysis(Integer stationId);
}