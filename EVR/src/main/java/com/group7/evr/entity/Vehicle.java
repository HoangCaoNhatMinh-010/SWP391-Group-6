package com.group7.evr.entity;

import com.group7.evr.enums.VehicleStatus;
import com.group7.evr.enums.converter.VehicleStatusConverter;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Date;

@Entity
@Table(name = "Vehicle")
@Data
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer vehicleId;
    @ManyToOne
    @JoinColumn(name = "ModelID")
    private Model model;
    @ManyToOne
    @JoinColumn(name = "StationID")
    private Station station;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String plateNumber;
    private BigDecimal batteryLevel;
    private BigDecimal mileage;
    @Convert(converter = VehicleStatusConverter.class)
    private VehicleStatus status = VehicleStatus.AVAILABLE;
    
    private Date lastMaintenanceDate;
}

