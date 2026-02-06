package com.group7.evr.entity;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.group7.evr.enums.UserRole;
import com.group7.evr.enums.UserRoleDeserializer;
import com.group7.evr.enums.UserStatus;
import com.group7.evr.enums.UserStatusDeserializer;
import com.group7.evr.enums.converter.UserRoleConverter;
import com.group7.evr.enums.converter.UserStatusConverter;
import jakarta.persistence.*;
import lombok.Data;

import java.sql.Date;
import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserID")
    private Integer userId;

    @Column(name = "Name", columnDefinition = "NVARCHAR(255)")
    private String name;

    @Column(name = "DateOfBirth")
    private Date dateOfBirth;

    @Column(name = "Email", columnDefinition = "NVARCHAR(255)")
    private String email;

    @Column(name = "Phone", columnDefinition = "NVARCHAR(255)")
    private String phone;

    @Column(name = "PasswordHash", columnDefinition = "NVARCHAR(255)")
    private String passwordHash;

    @Column(name = "Address", columnDefinition = "NVARCHAR(255)")
    private String address;

    @Column(name = "PersonalIdImage", columnDefinition = "NVARCHAR(255)")
    private String personalIdImage;

    @Column(name = "LicenseImage", columnDefinition = "NVARCHAR(255)")
    private String licenseImage;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "Role")
    @Convert(converter = UserRoleConverter.class)
    @JsonDeserialize(using = UserRoleDeserializer.class)
    private UserRole role;

    @Column(name = "Status")
    @Convert(converter = UserStatusConverter.class)
    @JsonDeserialize(using = UserStatusDeserializer.class)
    private UserStatus status = UserStatus.PENDING_VERIFICATION;

    @Column(name = "EmailVerified")
    private Boolean emailVerified = Boolean.FALSE;

    @Column(name = "VerifiedAt")
    private LocalDateTime verifiedAt;

    @Column(name = "VerificationToken", columnDefinition = "NVARCHAR(255)")
    private String verificationToken;

    @Column(name = "VerificationTokenExpiry")
    private LocalDateTime verificationTokenExpiry;

    // ⚠️ Đây là phần gây lỗi — phải map đúng tên foreign key trong bảng Users
    @ManyToOne
    @JoinColumn(name = "StationID") // CHÍNH XÁC tên cột trong bảng Users
    private Station station;
}

