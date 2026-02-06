package com.group7.evr.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Station")
@Data
public class Station {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "StationID")
    private Integer stationId;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String name;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String address;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String contactNumber;
    private Integer totalSlots;
    @Column(name = "AvailableSlots") // ✅ thêm dòng này
    private Integer availableSlots;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String operatingHours;

    // Geo location for map/nearby queries
    private Double latitude;
    private Double longitude;
}
