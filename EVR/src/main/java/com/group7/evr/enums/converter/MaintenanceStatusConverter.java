package com.group7.evr.enums.converter;

import com.group7.evr.enums.MaintenanceStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MaintenanceStatusConverter implements AttributeConverter<MaintenanceStatus, String> {

    @Override
    public String convertToDatabaseColumn(MaintenanceStatus attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public MaintenanceStatus convertToEntityAttribute(String dbData) {
        return MaintenanceStatus.fromString(dbData);
    }
}


