package com.group7.evr.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "StaffSchedule")
@Data
public class StaffSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer scheduleId;

    @ManyToOne
    @JoinColumn(name = "StaffID")
    private User staff;

    @ManyToOne
    @JoinColumn(name = "StationID")
    private Station station;

    private LocalDateTime shiftStart;
    private LocalDateTime shiftEnd;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String shiftType; // Morning, Afternoon, Evening, Night
    @Column(columnDefinition = "NVARCHAR(255)")
    private String status = "Scheduled"; // Scheduled, Active, Completed, Cancelled
    @Column(columnDefinition = "NVARCHAR(255)")
    private String notes;
}
