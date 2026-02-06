package com.group7.evr.entity;

import com.group7.evr.enums.DepositStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Deposit")
@Data
public class Deposit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer depositId;
    @ManyToOne
    @JoinColumn(name = "BookingID")
    private Booking booking;
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    private DepositStatus status = DepositStatus.HELD;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
