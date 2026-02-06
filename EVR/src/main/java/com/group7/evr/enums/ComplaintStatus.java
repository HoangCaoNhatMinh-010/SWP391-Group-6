package com.group7.evr.enums;

public enum ComplaintStatus {
    PENDING("Pending"),
    RESOLVED("Resolved"),
    REJECTED("Rejected");

    private final String value;

    ComplaintStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    public static ComplaintStatus fromString(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException("Complaint status cannot be null or blank");
        }
        String normalized = input.trim();
        try {
            return ComplaintStatus.valueOf(normalized.toUpperCase());
        } catch (IllegalArgumentException ex) {
            for (ComplaintStatus status : values()) {
                if (status.value.equalsIgnoreCase(normalized)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Unsupported complaint status: " + input, ex);
        }
    }
}
