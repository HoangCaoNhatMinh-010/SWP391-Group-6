package com.group7.evr.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "Model")
@Data
public class Model {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer modelId;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String brand;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String modelName;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String vehicleType;
    private BigDecimal basePrice;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String features;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String imageUrl;
}
