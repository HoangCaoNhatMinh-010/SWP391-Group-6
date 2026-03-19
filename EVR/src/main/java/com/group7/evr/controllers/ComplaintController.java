package com.group7.evr.controllers;

import com.group7.evr.entity.Complaint;
import com.group7.evr.entity.User;
import com.group7.evr.service.ComplaintService;
import com.group7.evr.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ComplaintController {
    private final ComplaintService complaintService;
    private final UserService userService;

    @PostMapping("/complaints")
    public ResponseEntity<Complaint> createComplaint(
            @RequestBody Complaint complaint,
            @RequestParam Integer userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(complaintService.createComplaint(complaint, user));
    }

    @GetMapping("/complaints/user")
    public ResponseEntity<List<Complaint>> getUserComplaints(@RequestParam Integer userId) {
        return ResponseEntity.ok(complaintService.getUserComplaints(userId));
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<Complaint> getComplaintById(@PathVariable Integer id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }
}

