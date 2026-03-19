package com.group7.evr.enums;

public enum PaymentMethod {
    CARD("Card"),
    E_WALLET("E-wallet"),
    CASH("Cash"),
    VNPAY("VNPay");

    private final String value;

    PaymentMethod(String value) {
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
