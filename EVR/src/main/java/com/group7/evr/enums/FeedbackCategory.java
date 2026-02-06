package com.group7.evr.enums;

public enum FeedbackCategory {
    VEHICLE("Vehicle"),
    SERVICE("Service");

    private final String value;

    FeedbackCategory(String value) {
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
