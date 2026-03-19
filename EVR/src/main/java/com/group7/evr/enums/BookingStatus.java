package com.group7.evr.enums;

public enum BookingStatus {
    PENDING("Pending"),
    CONFIRMED("Confirmed"),
    CANCELLED("Cancelled"),
    COMPLETED("Completed"),
    DENIED("Denied");

    private final String value;

    BookingStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    public static BookingStatus fromString(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException("Booking status cannot be null or blank");
        }
        String normalized = input.trim();
        try {
            return BookingStatus.valueOf(normalized.toUpperCase());
        } catch (IllegalArgumentException ex) {
            for (BookingStatus status : values()) {
                if (status.value.equalsIgnoreCase(normalized)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Unsupported booking status: " + input, ex);
        }
    }
}
