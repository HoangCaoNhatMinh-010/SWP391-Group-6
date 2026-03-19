package com.group7.evr.entity;

import com.group7.evr.enums.IssueCategory;
import com.group7.evr.enums.IssuePriority;
import com.group7.evr.enums.IssueStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "IssueReport")
@Data
public class IssueReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer issueReportId;

    @ManyToOne
    @JoinColumn(name = "VehicleID")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "UserID")
    private User reportedBy;

    @ManyToOne
    @JoinColumn(name = "StationID")
    private Station station;

    @Enumerated(EnumType.STRING)
    private IssueCategory issueCategory;
    
    @Enumerated(EnumType.STRING)
    private IssuePriority priority;
    
    @Column(columnDefinition = "NVARCHAR(255)")
    private String description;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String photos; // JSON array of photo URLs
    
    @Enumerated(EnumType.STRING)
    private IssueStatus status = IssueStatus.OPEN;
    private LocalDateTime reportedAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String resolutionNotes;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String assignedTo; // Staff member assigned to resolve
}

