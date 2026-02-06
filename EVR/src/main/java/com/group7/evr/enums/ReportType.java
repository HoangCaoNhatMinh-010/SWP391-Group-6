package com.group7.evr.enums;

public enum ReportType {
    PRE_RENTAL("PreRental"),
    POST_RENTAL("PostRental");

    private final String value;

    ReportType(String value) {
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
