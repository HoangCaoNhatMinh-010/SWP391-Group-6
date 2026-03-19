package com.group7.evr.repository;

import com.group7.evr.entity.Complaint;
import com.group7.evr.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint,Integer> {
    List<Complaint> findByStatus(ComplaintStatus status);
    List<Complaint> findByUserUserId(Integer userId);
}
