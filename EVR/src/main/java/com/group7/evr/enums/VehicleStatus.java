package com.group7.evr.enums;

public enum VehicleStatus {
    AVAILABLE("Available"),
    MAINTENANCE("Maintenance"),
    RENTED("Rented");
    private final String value;

    VehicleStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }
}
