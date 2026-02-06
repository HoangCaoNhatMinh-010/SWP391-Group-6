package com.group7.evr.repository;

import com.group7.evr.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract,Integer> {
    Optional<Contract> findByBookingBookingId(Integer bookingId);
    List<Contract> findByBookingUserUserId(Integer userId);
}
