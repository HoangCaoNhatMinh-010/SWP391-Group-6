package com.group7.evr.enums;

public enum UserRole {
    CUSTOMER("Customer"),
    STAFF("Staff"),
    ADMIN("Admin");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    public static UserRole fromString(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException("User role cannot be null or blank");
        }
        String normalized = input.trim();
        try {
            // Try enum name first (STAFF, CUSTOMER, ADMIN)
            return UserRole.valueOf(normalized.toUpperCase());
        } catch (IllegalArgumentException ex) {
            // Try matching by value (Customer, Staff, Admin)
            for (UserRole role : values()) {
                if (role.value.equalsIgnoreCase(normalized)) {
                    return role;
                }
            }
            throw new IllegalArgumentException("Unsupported user role: " + input, ex);
        }
    }
}
