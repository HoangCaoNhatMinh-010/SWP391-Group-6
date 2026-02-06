package com.group7.evr.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "RiskFlag")
@Data
public class RiskFlag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer riskFlagId;

    @ManyToOne
    @JoinColumn(name = "UserID")
    private User user;

    @ManyToOne
    @JoinColumn(name = "FlaggedBy")
    private User flaggedBy;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String reason;
    private Integer riskScore; // 1-10 scale
    @Column(columnDefinition = "NVARCHAR(255)")
    private String status = "Active"; // Active, Resolved, Dismissed
    private LocalDateTime flaggedAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;
}
