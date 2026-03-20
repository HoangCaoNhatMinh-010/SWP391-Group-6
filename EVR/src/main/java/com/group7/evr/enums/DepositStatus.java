package com.group7.evr.enums;

public enum DepositStatus {
    HELD("Held"),
    REFUNDED("Refunded"),
    FORFEITED("Forfeited");

    private final String value;

    DepositStatus(String value) {
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
