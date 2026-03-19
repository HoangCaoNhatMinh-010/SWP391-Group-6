package com.group7.evr.enums;

public enum MaintenanceStatus {
    OPEN("Open"),
    IN_PROGRESS("InProgress"),
    CLOSED("Closed");

    private final String value;

    MaintenanceStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    public static MaintenanceStatus fromString(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException("Maintenance status cannot be null or blank");
        }
        String normalized = input.trim();
        try {
            return MaintenanceStatus.valueOf(normalized.toUpperCase());
        } catch (IllegalArgumentException ex) {
            for (MaintenanceStatus status : values()) {
                if (status.value.equalsIgnoreCase(normalized)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Unsupported maintenance status: " + input, ex);
        }
    }
}
