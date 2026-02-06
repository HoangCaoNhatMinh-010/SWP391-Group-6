package com.group7.evr.entity;

import com.group7.evr.enums.ReportType;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "VehicleConditionReport")
@Data
public class VehicleConditionReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reportId;
    @ManyToOne
    @JoinColumn(name = "ContractID")
    private Contract contract;
    @ManyToOne
    @JoinColumn(name = "VehicleID")
    private Vehicle vehicle;
    @ManyToOne
    @JoinColumn(name = "StaffID")
    private User staff;
    private LocalDateTime reportTime = LocalDateTime.now();
    private BigDecimal battery;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String damageDescription;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String photos; // JSON array of photo URLs
    
    @Enumerated(EnumType.STRING)
    @Column(name = "ReportType")
    private ReportType reportType;
}
