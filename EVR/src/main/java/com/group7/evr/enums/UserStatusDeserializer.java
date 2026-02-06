package com.group7.evr.enums;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

public class UserStatusDeserializer extends JsonDeserializer<UserStatus> {
    @Override
    public UserStatus deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return UserStatus.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new IOException("Invalid UserStatus value: " + value, e);
        }
    }
}

