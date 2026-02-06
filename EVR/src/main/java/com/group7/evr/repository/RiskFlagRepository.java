package com.group7.evr.repository;

import com.group7.evr.entity.RiskFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskFlagRepository extends JpaRepository<RiskFlag, Integer> {
    List<RiskFlag> findByUserUserId(Integer userId);
    List<RiskFlag> findByStatus(String status);
    List<RiskFlag> findByRiskScoreGreaterThanEqual(Integer minScore);
}
