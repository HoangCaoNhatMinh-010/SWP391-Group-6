package com.group7.evr.repository;

import com.group7.evr.entity.StaffSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StaffScheduleRepository extends JpaRepository<StaffSchedule, Integer> {
    List<StaffSchedule> findByStaffUserId(Integer staffId);
    List<StaffSchedule> findByStationStationId(Integer stationId);
    List<StaffSchedule> findByShiftStartBetween(LocalDateTime start, LocalDateTime end);
    List<StaffSchedule> findByStatus(String status);
}
