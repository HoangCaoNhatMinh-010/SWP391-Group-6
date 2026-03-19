package com.group7.evr.service;

import com.group7.evr.entity.Booking;
import com.group7.evr.entity.Contract;
import com.group7.evr.entity.User;

import java.util.List;
import java.util.Map;

public interface BookingService {
    Booking createBooking(Booking booking, User user);

    Booking getBookingById(Integer bookingId);

    Map<String, Object> getUserBookingsWithFilters(Integer userId, String status, String fromDate, String toDate, int page, int size);
        
    Booking checkIn(Integer bookingId, User user, User staff);

    Booking returnVehicle(Integer bookingId, User user, User staff, Double batteryLevel);

    List<Booking> getUserHistory(Integer userId);

    List<Booking> getCheckInQueue(Integer staffId);

    List<Booking> getReturnQueue(Integer staffId);

    List<Booking> getStaffContracts(Integer staffId);

    Map<String, Object> getUserAnalytics(Integer userId);

    Map<String, Object> getAdvancedUserAnalytics(Integer userId);

    Booking modifyBooking(Integer bookingId, Booking updates, User actor);

    Booking cancelBooking(Integer bookingId, User actor);

    Booking denyBooking(Integer bookingId, User staff, String reason);

    Map<String, Object> settleBooking(Integer bookingId, User actor);
    Map<String, Object> getStaffContractsWithDetails(Integer staffId);
}
