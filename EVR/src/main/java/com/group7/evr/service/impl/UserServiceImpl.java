package com.group7.evr.service.impl;

import com.group7.evr.dto.UserRegistrationRequest;
import com.group7.evr.entity.AuditLog;
import com.group7.evr.entity.User;
import com.group7.evr.enums.UserRole;
import com.group7.evr.enums.UserStatus;
import com.group7.evr.repository.AuditLogRepository;
import com.group7.evr.repository.UserRepository;
import com.group7.evr.service.EmailService;
import com.group7.evr.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Date;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private final Path uploadDir = Paths.get("uploads");

    @Value("${app.auth.verification-url:http://localhost:8080/api/users/verify-email}")
    private String verificationEndpoint;

    @Override
    @Transactional
    public User register(UserRegistrationRequest request,
                         MultipartFile personalIdImage,
                         MultipartFile licenseImage) throws IOException {
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setRole(UserRole.CUSTOMER);
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEmailVerified(Boolean.FALSE);
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setVerificationTokenExpiry(LocalDateTime.now().plus(24, ChronoUnit.HOURS));
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(Date.valueOf(request.getDateOfBirth()));
        }

        if (personalIdImage != null && !personalIdImage.isEmpty()) {
            String personalIdPath = saveFile(personalIdImage);
            user.setPersonalIdImage(personalIdPath);
        }
        if (licenseImage != null && !licenseImage.isEmpty()) {
            String licensePath = saveFile(licenseImage);
            user.setLicenseImage(licensePath);
        }

        User savedUser = userRepository.save(user);
        logAudit(savedUser, "Registered user " + savedUser.getUserId());

        String verificationLink = UriComponentsBuilder
                .fromUriString(verificationEndpoint)
                .queryParam("token", savedUser.getVerificationToken())
                .build()
                .toUriString();

        emailService.sendRegistrationConfirmation(savedUser, verificationLink);
        return sanitizeUserData(savedUser);
    }

    @Override
    public User verifyEmailToken(String token) {
        if (!StringUtils.hasText(token)) {
            throw new RuntimeException("Invalid verification token");
        }

        User user = userRepository.findByVerificationToken(token);
        if (user == null) {
            throw new RuntimeException("Verification token is invalid or has already been used");
        }

        if (user.getVerificationTokenExpiry() != null && user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }

        user.setEmailVerified(Boolean.TRUE);
        user.setVerifiedAt(LocalDateTime.now());
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        user.setStatus(UserStatus.ACTIVE);

        User saved = userRepository.save(user);
        logAudit(saved, "User verified email");
        return saved;
    }

    @Override
    public User verifyUser(Integer userId, User staff) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.ACTIVE);
        logAudit(staff, "Verified user " + userId);
        return userRepository.save(user);
    }

    private String saveFile(MultipartFile file) throws IOException {
        Files.createDirectories(uploadDir);
        String originalName = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "document"));
        String fileName = UUID.randomUUID() + "_" + originalName;
        Path path = uploadDir.resolve(fileName);
        Files.write(path, file.getBytes());
        return path.toString();
    }

    @Override
    public void logAudit(User user, String action) {
        AuditLog log = new AuditLog();
        log.setUser(user);
        log.setAction(action);
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    @Override
    public User getUserById(Integer userId) {
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public Map<String, Object> login(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Invalid email or password");
        }
        
        if (user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        if (!Boolean.TRUE.equals(user.getEmailVerified()) || UserStatus.PENDING_VERIFICATION.equals(user.getStatus())) {
            throw new RuntimeException("Tài khoản chưa được xác thực. Vui lòng kiểm tra email của bạn.");
        }

        if (UserStatus.SUSPENDED.equals(user.getStatus()) || UserStatus.DELETED.equals(user.getStatus())) {
            throw new RuntimeException("Account is not active");
        }
        
        // Generate JWT token (mock implementation)
        String token = "jwt_token_" + user.getUserId() + "_" + System.currentTimeMillis();
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", sanitizeUserData(user));
        response.put("message", "Login successful");
        
        logAudit(user, "User logged in");
        return response;
    }

    @Override
    public User updateUser(Integer userId, User userUpdates) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // If updating a staff user, use updateStaff method
        if (UserRole.STAFF.equals(existingUser.getRole())) {
            return updateStaff(userId, userUpdates);
        }
        
        // Update allowed fields only for non-staff users
        if (userUpdates.getName() != null) {
            existingUser.setName(userUpdates.getName());
        }
        if (userUpdates.getPhone() != null) {
            existingUser.setPhone(userUpdates.getPhone());
        }
        if (userUpdates.getAddress() != null) {
            existingUser.setAddress(userUpdates.getAddress());
        }
        if (userUpdates.getEmail() != null) {
            existingUser.setEmail(userUpdates.getEmail());
        }
        if (userUpdates.getDateOfBirth() != null) {
            existingUser.setDateOfBirth(userUpdates.getDateOfBirth());
        }
        if (userUpdates.getStatus() != null) {
            existingUser.setStatus(userUpdates.getStatus());
        }
        
        User updatedUser = userRepository.save(existingUser);
        logAudit(updatedUser, "Updated user profile " + userId);
        return updatedUser;
    }

    @Override
    public void changePassword(Integer userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentPassword == null || currentPassword.isBlank()) {
            throw new RuntimeException("Current password is required");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("New password is required");
        }
        if (user.getPasswordHash() == null || !passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logAudit(user, "Updated user password");
    }

    private User sanitizeUserData(User user) {
        User sanitized = new User();
        sanitized.setUserId(user.getUserId());
        sanitized.setName(user.getName());
        sanitized.setEmail(user.getEmail());
        sanitized.setPhone(user.getPhone());
        sanitized.setAddress(user.getAddress());
        sanitized.setRole(user.getRole());
        sanitized.setStatus(user.getStatus());
        sanitized.setCreatedAt(user.getCreatedAt());
        sanitized.setEmailVerified(user.getEmailVerified());
        sanitized.setVerifiedAt(user.getVerifiedAt());
        // Don't include password hash, personal documents, etc.
        return sanitized;
    }

    @Override
    public Map<String, Object> getAllUsers(int page, int size, String role, String status) {
        List<User> allUsers = userRepository.findAll();
        
        // Apply filters
        List<User> filteredUsers = allUsers.stream()
                .filter(user -> role == null || user.getRole().toString().equals(role))
                .filter(user -> status == null || user.getStatus().toString().equals(status))
                .toList();
        
        // Apply pagination
        int start = page * size;
        int end = Math.min(start + size, filteredUsers.size());
        List<User> paginatedUsers = filteredUsers.subList(start, end);
        
        Map<String, Object> response = new HashMap<>();
        response.put("users", paginatedUsers);
        response.put("totalCount", filteredUsers.size());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", (int) Math.ceil((double) filteredUsers.size() / size));
        
        return response;
    }

    @Override
    public List<User> getRiskUsers() {
        return userRepository.findAll().stream()
                .filter(user -> UserRole.CUSTOMER.equals(user.getRole()))
                .filter(user -> {
                    // Check if user has risk flags (would need to implement risk flag checking)
                    // For now, return users with status != "Active"
                    return !UserStatus.ACTIVE.equals(user.getStatus());
                })
                .toList();
    }

    @Override
    public User updateUserStatus(Integer userId, String status, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate status
        if (!isValidStatus(status)) {
            throw new RuntimeException("Invalid status. Must be: Active, Suspended, Banned");
        }
        
        String oldStatus = user.getStatus().toString();
        user.setStatus(UserStatus.valueOf(status.toUpperCase()));
        User updatedUser = userRepository.save(user);
        
        logAudit(updatedUser, "Updated user status from " + oldStatus + " to " + status + 
                (reason != null ? " - Reason: " + reason : ""));
        
        return updatedUser;
    }

    private boolean isValidStatus(String status) {
        if (status == null) {
            return false;
        }
        return Arrays.stream(UserStatus.values())
                .anyMatch(userStatus -> userStatus.name().equalsIgnoreCase(status)
                        || userStatus.getValue().equalsIgnoreCase(status));
    }

    @Override
    public User createStaff(User staff) {
        // Validate required fields
        if (staff.getName() == null || staff.getName().trim().isEmpty()) {
            throw new RuntimeException("Staff name is required");
        }
        if (staff.getEmail() == null || staff.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Staff email is required");
        }
        
        // Set staff-specific defaults
        staff.setRole(UserRole.STAFF);
        staff.setStatus(UserStatus.ACTIVE);
        String rawPassword = staff.getPasswordHash();
        if (!StringUtils.hasText(rawPassword)) {
            rawPassword = "default_password_" + System.currentTimeMillis();
        }
        staff.setPasswordHash(passwordEncoder.encode(rawPassword));
        staff.setEmailVerified(Boolean.TRUE);
        staff.setVerifiedAt(LocalDateTime.now());
        
        User savedStaff = userRepository.save(staff);
        logAudit(savedStaff, "Created staff " + savedStaff.getUserId());
        return savedStaff;
    }

    @Override
    public List<User> getStaff(Integer stationId) {
        List<User> allUsers = userRepository.findAll();
        
        return allUsers.stream()
                .filter(user -> UserRole.STAFF.equals(user.getRole()))
                .filter(user -> stationId == null || (user.getStation() != null && user.getStation().getStationId().equals(stationId)))
                .toList();
    }

    @Override
    public User getPrimaryStaffForStation(Integer stationId) {
        if (stationId == null) {
            throw new RuntimeException("Station ID is required to resolve staff");
        }
        return getStaff(stationId).stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No staff assigned to station " + stationId));
    }

    @Override
    public User updateStaff(Integer staffId, User staffUpdates) {
        User existingStaff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        
        if (!UserRole.STAFF.equals(existingStaff.getRole())) {
            throw new RuntimeException("User is not a staff member");
        }
        
        // Update allowed fields
        if (staffUpdates.getName() != null) {
            existingStaff.setName(staffUpdates.getName());
        }
        if (staffUpdates.getPhone() != null) {
            existingStaff.setPhone(staffUpdates.getPhone());
        }
        if (staffUpdates.getAddress() != null) {
            existingStaff.setAddress(staffUpdates.getAddress());
        }
        if (staffUpdates.getEmail() != null) {
            existingStaff.setEmail(staffUpdates.getEmail());
        }
        if (staffUpdates.getDateOfBirth() != null) {
            existingStaff.setDateOfBirth(staffUpdates.getDateOfBirth());
        }
        if (staffUpdates.getStatus() != null) {
            existingStaff.setStatus(staffUpdates.getStatus());
        }
        // Station can be updated, but is not required if not provided (existing station is kept)
        if (staffUpdates.getStation() != null && staffUpdates.getStation().getStationId() != null) {
            existingStaff.setStation(staffUpdates.getStation());
        }
        // Only validate station if it's being removed (set to null explicitly)
        // If station is not in the update, keep the existing one
        
        User updatedStaff = userRepository.save(existingStaff);
        logAudit(updatedStaff, "Updated staff " + staffId);
        return updatedStaff;
    }

    @Override
    public Map<String, Object> deleteStaff(Integer staffId) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        
        if (!UserRole.STAFF.equals(staff.getRole())) {
            throw new RuntimeException("User is not a staff member");
        }
        
        // Check for active bookings/handovers (would need to implement this check)
        // For now, we'll allow deletion but log a warning
        
        // Soft delete by setting status to 'Inactive'
        staff.setStatus(UserStatus.DELETED);
        userRepository.save(staff);
        
        logAudit(staff, "Deleted staff " + staffId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Staff deleted successfully");
        response.put("staffId", staffId);
        return response;
    }
}

