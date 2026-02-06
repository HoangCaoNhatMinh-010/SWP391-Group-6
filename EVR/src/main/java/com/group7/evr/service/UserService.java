package com.group7.evr.service;

import com.group7.evr.dto.UserRegistrationRequest;
import com.group7.evr.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface UserService {
    User register(UserRegistrationRequest request,
                         MultipartFile personalIdImage,
                  MultipartFile licenseImage) throws IOException;

    User verifyEmailToken(String token);

    User verifyUser(Integer userId, User staff);

    User getUserById(Integer userId);

    Map<String, Object> login(String email, String password);

    User updateUser(Integer userId, User userUpdates);

    void changePassword(Integer userId, String currentPassword, String newPassword);

    Map<String, Object> getAllUsers(int page, int size, String role, String status);

    List<User> getRiskUsers();

    User updateUserStatus(Integer userId, String status, String reason);

    User createStaff(User staff);

    List<User> getStaff(Integer stationId);

    User getPrimaryStaffForStation(Integer stationId);

    User updateStaff(Integer staffId, User staffUpdates);

    Map<String, Object> deleteStaff(Integer staffId);

    void logAudit(User user, String action);
}
