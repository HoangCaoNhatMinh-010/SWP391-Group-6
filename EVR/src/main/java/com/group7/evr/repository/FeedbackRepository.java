package com.group7.evr.repository;

import com.group7.evr.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback,Integer> {
    List<Feedback> findByUserUserId(Integer userId);
    List<Feedback> findByContractContractId(Integer contractId);
}
