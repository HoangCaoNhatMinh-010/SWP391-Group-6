package com.group7.evr.controllers;

import com.group7.evr.entity.Booking;
import com.group7.evr.entity.User;
import com.group7.evr.service.BookingService;
import com.group7.evr.service.UserService;
import com.group7.evr.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;
    private final UserService userService;
    private final ContractRepository contractRepository;

    // 2c. Book vehicle
    @PostMapping("/bookings")
    public ResponseEntity<Booking> createBooking(
            @RequestBody Booking booking,
            @RequestParam Integer userId) {

        User user = userService.getUserById(userId);
        return ResponseEntity.ok(bookingService.createBooking(booking, user));
    }

    // Get booking details
    @GetMapping("/bookings/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // 3a. Check-in
    @PutMapping("/bookings/{id}/checkin")
    public ResponseEntity<Booking> checkIn(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestBody User staff) {

        User user = userService.getUserById(userId);
        return ResponseEntity.ok(bookingService.checkIn(id, user, staff));
    }

    // 4a. Return vehicle
    @PutMapping("/bookings/{id}/return")
    public ResponseEntity<Booking> returnVehicle(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestBody Map<String, Object> returnData) {

        User user = userService.getUserById(userId);
        User staff = user; // Staff is the same as user for now
        Double batteryLevel = returnData.containsKey("batteryLevel") && returnData.get("batteryLevel") != null 
            ? ((Number) returnData.get("batteryLevel")).doubleValue() : null;
        return ResponseEntity.ok(bookingService.returnVehicle(id, user, staff, batteryLevel));
    }

    @GetMapping("/staff/bookings/checkin-queue")
    public ResponseEntity<List<Booking>> getCheckInQueue(@RequestParam Integer staffId) {
        return ResponseEntity.ok(bookingService.getCheckInQueue(staffId));
    }

    @GetMapping("/staff/bookings/return-queue")
    public ResponseEntity<List<Booking>> getReturnQueue(@RequestParam Integer staffId) {
        return ResponseEntity.ok(bookingService.getReturnQueue(staffId));
    }

    @GetMapping("/staff/bookings/contracts")
    public ResponseEntity<Map<String, Object>> getStaffContracts(@RequestParam Integer staffId) {
        return ResponseEntity.ok(bookingService.getStaffContractsWithDetails(staffId));
    }

    @GetMapping("/staff/bookings/{bookingId}/contract")
    public ResponseEntity<Map<String, Object>> getContractByBookingId(@PathVariable Integer bookingId) {
        Booking booking = bookingService.getBookingById(bookingId);
        Map<String, Object> response = new HashMap<>();
        response.put("booking", booking);
        
        // Find contract for this booking
        contractRepository.findByBookingBookingId(bookingId)
            .ifPresent(contract -> {
                Map<String, Object> contractData = new HashMap<>();
                contractData.put("contractId", contract.getContractId());
                contractData.put("renterSignature", contract.getRenterSignature());
                contractData.put("staffSignature", contract.getStaffSignature());
                contractData.put("signedAt", contract.getSignedAt());
                contractData.put("status", contract.getStatus() != null ? contract.getStatus().toString() : null);
                response.put("contract", contractData);
            });
        
        return ResponseEntity.ok(response);
    }

    // 5a. History
    @GetMapping("/bookings/user")
    public ResponseEntity<List<Booking>> getHistory(@RequestParam Integer userId) {
        return ResponseEntity.ok(bookingService.getUserHistory(userId));
    }

    // Enhanced user booking history with pagination and filtering
    @GetMapping("/bookings/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserBookings(
            @PathVariable Integer userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(bookingService.getUserBookingsWithFilters(userId, status, fromDate, toDate, page, size));
    }

    // 5b. Analytics
    @GetMapping("/analytics/user")
    public ResponseEntity<Map<String, Object>> getAnalytics(@RequestParam Integer userId) {
        return ResponseEntity.ok(bookingService.getUserAnalytics(userId));
    }

    // Advanced analytics
    @GetMapping("/analytics/user/advanced")
    public ResponseEntity<Map<String, Object>> getAdvancedAnalytics(@RequestParam Integer userId) {
        return ResponseEntity.ok(bookingService.getAdvancedUserAnalytics(userId));
    }

    // New: modify booking
    @PutMapping("/bookings/{id}")
    public ResponseEntity<Booking> modifyBooking(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestBody Booking updates) {
        User actor = userService.getUserById(userId);
        return ResponseEntity.ok(bookingService.modifyBooking(id, updates, actor));
    }

    // New: cancel booking
    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable Integer id,
            @RequestParam Integer userId) {
        User actor = userService.getUserById(userId);
        return ResponseEntity.ok(bookingService.cancelBooking(id, actor));
    }

    // New: deny booking (staff only)
    @PutMapping("/bookings/{id}/deny")
    public ResponseEntity<Booking> denyBooking(
            @PathVariable Integer id,
            @RequestParam Integer staffId,
            @RequestBody(required = false) Map<String, String> request) {
        User staff = userService.getUserById(staffId);
        String reason = request != null ? request.get("reason") : null;
        return ResponseEntity.ok(bookingService.denyBooking(id, staff, reason));
    }

    // New: settlement
    @PostMapping("/bookings/{id}/settlement")
    public ResponseEntity<Map<String, Object>> settle(
            @PathVariable Integer id,
            @RequestParam Integer userId) {
        User actor = userService.getUserById(userId);
        return ResponseEntity.ok(bookingService.settleBooking(id, actor));
    }

    // Placeholder: return inspection upload (extend later with multipart)
    @PostMapping("/bookings/{id}/return-inspection")
    public ResponseEntity<String> uploadReturnInspection(
            @PathVariable Integer id,
            @RequestParam Integer userId) {
        userService.getUserById(userId);
        // TODO: implement with file uploads & checklist
        return ResponseEntity.ok("Return inspection received for booking " + id);
    }
}