package com.group7.evr.enums;

public enum ContractStatus {
    ACTIVE("Active"),
    COMPLETED("Completed"),
    VIOLATED("Violated");

    private final String value;

    ContractStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    public static ContractStatus fromString(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException("Contract status cannot be null or blank");
        }
        String normalized = input.trim();
        try {
            return ContractStatus.valueOf(normalized.toUpperCase());
        } catch (IllegalArgumentException ex) {
            for (ContractStatus status : values()) {
                if (status.value.equalsIgnoreCase(normalized)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Unsupported contract status: " + input, ex);
        }
    }
}
