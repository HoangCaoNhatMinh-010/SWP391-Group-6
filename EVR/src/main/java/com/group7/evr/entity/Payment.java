package com.group7.evr.entity;

import com.group7.evr.enums.PaymentMethod;
import com.group7.evr.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Payment")
@Data
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer paymentId;
    @ManyToOne
    @JoinColumn(name = "BookingID")
    private Booking booking;
    
    @Enumerated(EnumType.STRING)
    private PaymentMethod method;
    
    private BigDecimal amount;
    private LocalDateTime paymentDate = LocalDateTime.now();
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

}
