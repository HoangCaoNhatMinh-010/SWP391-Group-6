package com.group7.evr.enums;

public enum IssueStatus {
    OPEN("Open"),
    IN_PROGRESS("InProgress"),
    RESOLVED("Resolved"),
    CLOSED("Closed");

    private final String value;

    IssueStatus(String value) {
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
