package com.group7.evr.controllers;

import com.group7.evr.entity.User;
import com.group7.evr.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StaffController {
    private final UserService userService;

    // Admin: Staff management
    @PostMapping("/staff")
    public ResponseEntity<User> createStaff(@RequestBody User staff) {
        return ResponseEntity.ok(userService.createStaff(staff));
    }

    @GetMapping("/staff")
    public ResponseEntity<List<User>> getStaff(
            @RequestParam(required = false) Integer stationId) {
        return ResponseEntity.ok(userService.getStaff(stationId));
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<User> updateStaff(@PathVariable Integer id, @RequestBody User staffUpdates) {
        return ResponseEntity.ok(userService.updateStaff(id, staffUpdates));
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<Map<String, Object>> deleteStaff(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.deleteStaff(id));
    }
}

