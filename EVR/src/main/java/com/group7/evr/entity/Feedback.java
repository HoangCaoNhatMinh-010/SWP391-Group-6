package com.group7.evr.entity;

import com.group7.evr.enums.FeedbackCategory;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Feedback")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer feedbackId;
    @ManyToOne
    @JoinColumn(name = "ContractID")
    private Contract contract;
    @ManyToOne
    @JoinColumn(name = "UserID")
    private User user;
    
    @Enumerated(EnumType.STRING)
    private FeedbackCategory category;
    
    private Integer stars;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String comment;
    private LocalDateTime createdAt = LocalDateTime.now();
}
