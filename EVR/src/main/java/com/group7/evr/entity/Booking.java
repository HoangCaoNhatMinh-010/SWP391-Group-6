package com.group7.evr.entity;

import com.group7.evr.enums.BookingStatus;
import com.group7.evr.enums.converter.BookingStatusConverter;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Date;

@Entity
@Table(name = "Booking")
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bookingId;
    @ManyToOne
    @JoinColumn(name = "UserID")
    private User user;
    @ManyToOne
    @JoinColumn(name = "VehicleID")
    private Vehicle vehicle;
    @ManyToOne
    @JoinColumn(name = "StationID")
    private Station station;
    @ManyToOne
    @JoinColumn(name = "StaffID")
    private User staff;
    private Date startTime;
    private Date endTime;
    private BigDecimal totalPrice;

    @Column(name = "BookingStatus")
    @Convert(converter = BookingStatusConverter.class)
    private BookingStatus bookingStatus = BookingStatus.PENDING;
}
