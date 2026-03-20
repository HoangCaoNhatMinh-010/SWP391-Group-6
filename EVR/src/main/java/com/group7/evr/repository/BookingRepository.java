package com.group7.evr.repository;

import com.group7.evr.entity.Booking;
import com.group7.evr.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.sql.Date;
// import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface BookingRepository extends JpaRepository<Booking,Integer> {
    List<Booking> findByUserUserId(Integer userId);
    List<Booking> findByStationStationIdAndBookingStatusIn(Integer stationId, List<BookingStatus> statuses);
    List<Booking> findByStationStationId(Integer stationId);
    List<Booking> findByBookingStatus(BookingStatus status);
    List<Booking> findByVehicleVehicleId(Integer vehicleId);
    List<Booking> findByStaffUserId(Integer staffId);
    @Query("""
        SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
        FROM Booking b
        WHERE b.vehicle.vehicleId = :vehicleId
        AND b.bookingStatus IN ('PENDING','CONFIRMED')
        AND :startTime < b.endTime
        AND :endTime > b.startTime
    """)
    boolean existsConflict(
            Integer vehicleId,
            Date startTime,
            Date endTime
    );
}
