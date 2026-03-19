package com.group7.evr.enums.converter;

import com.group7.evr.enums.UserStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;

@Converter(autoApply = true)
public class UserStatusConverter implements AttributeConverter<UserStatus, String> {

    @Override
    public String convertToDatabaseColumn(UserStatus attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public UserStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }

        String normalized = dbData.trim();
        try {
            return UserStatus.valueOf(normalized.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return Arrays.stream(UserStatus.values())
                    .filter(status -> status.getValue().equalsIgnoreCase(normalized))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unsupported user status: " + dbData, ex));
        }
    }
}


