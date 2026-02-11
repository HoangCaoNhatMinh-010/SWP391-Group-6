package com.group7.evr.service;

import com.group7.evr.entity.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface StationStaffService {

    public List<Vehicle> getVehiclesByStatus(Integer staffId, String status);

    public VehicleConditionReport createHandoverReport(Integer staffId, Integer contractId, Integer vehicleId,
                                                       BigDecimal battery, String damageDescription, MultipartFile[] photos,
                                                       String reportType) throws IOException;

    public Contract signContract(Integer staffId, Integer bookingId, String renterSignature, String staffSignature);

    public User verifyCustomer(Integer staffId, Integer userId);

    public Payment recordPayment(Integer staffId, Integer bookingId, String method, BigDecimal amount);



    public Vehicle updateVehicleStatus(Integer staffId, Integer vehicleId, BigDecimal batteryLevel, BigDecimal mileage, String status);

    public Complaint reportVehicleIssue(Integer staffId, Integer vehicleId, String issueDescription);

    public Maintenance createMaintenance(Integer staffId, Integer vehicleId, String issue, LocalDateTime scheduledAt);

    public Maintenance updateMaintenance(Integer staffId, Integer maintenanceId, String status, String remarks);

    public List<Maintenance> listMaintenance(Integer staffId, String status);
}