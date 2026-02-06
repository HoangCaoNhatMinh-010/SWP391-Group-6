package com.group7.evr.repository;

import com.group7.evr.entity.IssueReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueReportRepository extends JpaRepository<IssueReport, Integer> {
    List<IssueReport> findByVehicleVehicleId(Integer vehicleId);
    List<IssueReport> findByStationStationId(Integer stationId);
    List<IssueReport> findByStatus(String status);
    List<IssueReport> findByPriority(String priority);
    List<IssueReport> findByIssueCategory(String category);
}

