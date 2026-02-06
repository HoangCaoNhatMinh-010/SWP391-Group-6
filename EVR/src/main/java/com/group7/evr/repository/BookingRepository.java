package com.group7.evr.repository;

import com.group7.evr.entity.Booking;
import com.group7.evr.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface BookingRepository extends JpaRepository<Booking,Integer> {
    List<Booking> findByUserUserId(Integer userId);
    List<Booking> findByStationStationIdAndBookingStatusIn(Integer stationId, List<BookingStatus> statuses);
    List<Booking> findByStationStationId(Integer stationId);
    List<Booking> findByBookingStatus(BookingStatus status);
    List<Booking> findByVehicleVehicleId(Integer vehicleId);
    List<Booking> findByStaffUserId(Integer staffId);
}
