package com.group7.evr.enums.converter;

import com.group7.evr.enums.VehicleStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;

@Converter(autoApply = true)
public class VehicleStatusConverter implements AttributeConverter<VehicleStatus, String> {

    @Override
    public String convertToDatabaseColumn(VehicleStatus attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public VehicleStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }

        String normalized = dbData.trim();
        try {
            return VehicleStatus.valueOf(normalized.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return Arrays.stream(VehicleStatus.values())
                    .filter(status -> status.getValue().equalsIgnoreCase(normalized))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unsupported vehicle status value: " + dbData, ex));
        }
    }
}


