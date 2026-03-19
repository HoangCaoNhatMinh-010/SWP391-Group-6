package com.group7.evr.entity;

import com.group7.evr.enums.ComplaintStatus;
import com.group7.evr.enums.converter.ComplaintStatusConverter;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Complaint")
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer complaintId;
    @ManyToOne
    @JoinColumn(name = "ContractID")
    private Contract contract;
    @ManyToOne
    @JoinColumn(name = "UserID")
    private User user;
    @ManyToOne
    @JoinColumn(name = "StaffID")
    private User staff;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String issueDescription;
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Convert(converter = ComplaintStatusConverter.class)
    private ComplaintStatus status = ComplaintStatus.PENDING;
    
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String adminResponse;
    
    private LocalDateTime respondedAt;
    
    @ManyToOne
    @JoinColumn(name = "RespondedByAdminID")
    private User respondedByAdmin;
}