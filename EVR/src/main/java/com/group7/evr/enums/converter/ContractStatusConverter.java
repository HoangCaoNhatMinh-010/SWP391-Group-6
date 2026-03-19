package com.group7.evr.enums.converter;

import com.group7.evr.enums.ContractStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ContractStatusConverter implements AttributeConverter<ContractStatus, String> {

    @Override
    public String convertToDatabaseColumn(ContractStatus attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public ContractStatus convertToEntityAttribute(String dbData) {
        return ContractStatus.fromString(dbData);
    }
}


