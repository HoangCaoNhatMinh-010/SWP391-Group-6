package com.group7.evr.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "AuditLog")
@Data
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer logId;
    @ManyToOne
    @JoinColumn(name = "UserID")
    private User user;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String action;
    private LocalDateTime timestamp = LocalDateTime.now();
}
