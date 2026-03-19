package com.group7.evr.service.impl;

import com.group7.evr.entity.Complaint;
import com.group7.evr.entity.Contract;
import com.group7.evr.entity.User;
import com.group7.evr.enums.ComplaintStatus;
import com.group7.evr.repository.ComplaintRepository;
import com.group7.evr.repository.ContractRepository;
import com.group7.evr.service.ComplaintService;
import com.group7.evr.service.EmailService;
import com.group7.evr.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintServiceImpl implements ComplaintService {
    private final ComplaintRepository complaintRepository;
    private final ContractRepository contractRepository;
    private final UserService userService;
    private final EmailService emailService;

    @Override
    @Transactional
    public Complaint createComplaint(Complaint complaint, User user) {
        Contract contract = null;
        
        // Try to get contract by contractId first
        if (complaint.getContract() != null && complaint.getContract().getContractId() != null) {
            contract = contractRepository.findById(complaint.getContract().getContractId())
                    .orElse(null);
        }
        
        // If contract not found, try to find by bookingId (if contractId was actually bookingId)
        if (contract == null && complaint.getContract() != null && complaint.getContract().getContractId() != null) {
            contract = contractRepository.findByBookingBookingId(complaint.getContract().getContractId())
                    .orElse(null);
        }
        
        if (contract == null) {
            throw new RuntimeException("Contract not found for this booking");
        }
        
        // Verify that the contract belongs to the user
        if (contract.getBooking() == null || 
            contract.getBooking().getUser() == null ||
            !contract.getBooking().getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Contract does not belong to this user");
        }
        
        if (complaint.getIssueDescription() == null || complaint.getIssueDescription().trim().isEmpty()) {
            throw new RuntimeException("Issue description is required");
        }
        
        complaint.setUser(user);
        complaint.setContract(contract);
        complaint.setStatus(ComplaintStatus.PENDING);
        
        Complaint savedComplaint = complaintRepository.save(complaint);
        log.info("Complaint created successfully with ID: {}", savedComplaint.getComplaintId());
        return savedComplaint;
    }

    @Override
    public List<Complaint> getUserComplaints(Integer userId) {
        return complaintRepository.findByUserUserId(userId);
    }

    @Override
    public Complaint getComplaintById(Integer id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
    }

    @Override
    @Transactional
    public Complaint respondToComplaint(Integer complaintId, String response, ComplaintStatus status, User admin) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        
        if (complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new RuntimeException("Complaint has already been responded to");
        }
        
        if (response == null || response.trim().isEmpty()) {
            throw new RuntimeException("Response is required");
        }
        
        if (status == null) {
            throw new RuntimeException("Status is required");
        }
        
        if (status == ComplaintStatus.PENDING) {
            throw new RuntimeException("Cannot set status to PENDING when responding");
        }
        
        complaint.setAdminResponse(response);
        complaint.setStatus(status);
        complaint.setRespondedAt(LocalDateTime.now());
        complaint.setRespondedByAdmin(admin);
        
        Complaint savedComplaint = complaintRepository.save(complaint);
        
        // Log audit
        userService.logAudit(admin, "Responded to complaint " + complaintId + " with status: " + status);
        
        // Send email notification to user
        try {
            emailService.sendComplaintResponse(complaint);
            log.info("Sent complaint response email to user {}", complaint.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send complaint response email", e);
            // Don't throw exception, just log the error
        }
        
        return savedComplaint;
    }
}

