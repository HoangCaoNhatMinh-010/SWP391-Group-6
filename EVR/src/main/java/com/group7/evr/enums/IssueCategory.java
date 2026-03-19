package com.group7.evr.enums;

public enum IssueCategory {
    MECHANICAL("mechanical"),
    ELECTRICAL("electrical"),
    COSMETIC("cosmetic"),
    SAFETY("safety");

    private final String value;

    IssueCategory(String value) {
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
