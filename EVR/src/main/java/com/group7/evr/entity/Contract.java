package com.group7.evr.entity;

import com.group7.evr.enums.ContractStatus;
import com.group7.evr.enums.converter.ContractStatusConverter;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "Contract")
@Data
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer contractId;
    @ManyToOne
    @JoinColumn(name = "BookingID")
    private Booking booking;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String renterSignature;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String staffSignature;
    private LocalDateTime signedAt = LocalDateTime.now();
    
    @Convert(converter = ContractStatusConverter.class)
    private ContractStatus status = ContractStatus.ACTIVE;
}
