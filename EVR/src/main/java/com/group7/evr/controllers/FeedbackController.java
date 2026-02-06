package com.group7.evr.controllers;

import com.group7.evr.entity.Feedback;
import com.group7.evr.entity.User;
import com.group7.evr.service.FeedbackService;
import com.group7.evr.service.impl.FeedbackServiceImpl;
import com.group7.evr.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FeedbackController {
    private final FeedbackService feedbackService;
    private final UserService userService;

    @PostMapping("/feedback")
    public ResponseEntity<Feedback> createFeedback(
            @RequestBody Feedback feedback,
            @RequestParam Integer userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(feedbackService.createFeedback(feedback, user));
    }

    @GetMapping("/feedback/user")
    public ResponseEntity<List<Feedback>> getUserFeedback(@RequestParam Integer userId) {
        return ResponseEntity.ok(feedbackService.getUserFeedback(userId));
    }

    @GetMapping("/feedback/contract/{contractId}")
    public ResponseEntity<List<Feedback>> getContractFeedback(@PathVariable Integer contractId) {
        return ResponseEntity.ok(feedbackService.getContractFeedback(contractId));
    }
}

