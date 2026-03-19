package com.group7.evr.controllers;

import com.group7.evr.dto.UserRegistrationRequest;
import com.group7.evr.entity.User;
import com.group7.evr.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @Value("${app.frontend.login-url:http://localhost:5173/login}")
    private String loginRedirectUrl;

    @PostMapping("/users/register")
    public ResponseEntity<User> register(@Valid @ModelAttribute UserRegistrationRequest request,
                                         @RequestParam(value = "personalIdImage", required = false) MultipartFile personalIdImage,
                                         @RequestParam(value = "licenseImage", required = false) MultipartFile licenseImage) throws IOException {
        return ResponseEntity.ok(userService.register(request, personalIdImage, licenseImage));
    }

    @PostMapping("/users/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        return ResponseEntity.ok(userService.login(email, password));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User userUpdates) {
        return ResponseEntity.ok(userService.updateUser(id, userUpdates));
    }

    @PutMapping("/users/{id}/password")
    public ResponseEntity<Map<String, String>> changePassword(@PathVariable Integer id,
                                                              @RequestBody Map<String, String> payload) {
        userService.changePassword(id, payload.get("currentPassword"), payload.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @PutMapping("/users/{id}/verify")
    public ResponseEntity<User> verify(@PathVariable Integer id, @RequestBody User staff) { // Assume staff from auth
        return ResponseEntity.ok(userService.verifyUser(id, staff));
    }

    // Admin: Customer management
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(userService.getAllUsers(page, size, role, status));
    }

    @GetMapping("/users/risk")
    public ResponseEntity<List<User>> getRiskUsers() {
        return ResponseEntity.ok(userService.getRiskUsers());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable Integer id,
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(userService.updateUserStatus(id, status, reason));
    }

    @GetMapping("/users/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam("token") String token) {
        try {
            userService.verifyEmailToken(token);
            URI redirectUri = UriComponentsBuilder.fromUriString(loginRedirectUrl)
                    .queryParam("verified", "true")
                    .build(true)
                    .toUri();
            return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();
        } catch (RuntimeException ex) {
            URI redirectUri = UriComponentsBuilder.fromUriString(loginRedirectUrl)
                    .queryParam("verified", "false")
                    .queryParam("reason", ex.getMessage())
                    .build(true)
                    .toUri();
            return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();
        }
    }
}
