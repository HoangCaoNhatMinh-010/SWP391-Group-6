package com.group7.evr.enums.converter;

import com.group7.evr.enums.BookingStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class BookingStatusConverter implements AttributeConverter<BookingStatus, String> {

    @Override
    public String convertToDatabaseColumn(BookingStatus attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public BookingStatus convertToEntityAttribute(String dbData) {
        return BookingStatus.fromString(dbData);
    }
}


