package com.group7.evr.enums.converter;

import com.group7.evr.enums.ComplaintStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ComplaintStatusConverter implements AttributeConverter<ComplaintStatus, String> {

    @Override
    public String convertToDatabaseColumn(ComplaintStatus attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public ComplaintStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }

        return ComplaintStatus.fromString(dbData);
    }
}


