package com.group7.evr.repository;

import com.group7.evr.entity.VehicleConditionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleConditionReportRepository extends JpaRepository<VehicleConditionReport,Integer> {
}
