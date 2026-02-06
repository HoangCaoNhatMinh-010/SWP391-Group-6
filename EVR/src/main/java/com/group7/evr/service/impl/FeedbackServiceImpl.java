package com.group7.evr.service.impl;

import com.group7.evr.entity.Contract;
import com.group7.evr.entity.Feedback;
import com.group7.evr.entity.User;
import com.group7.evr.repository.ContractRepository;
import com.group7.evr.repository.FeedbackRepository;
import com.group7.evr.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FeedbackServiceImpl implements FeedbackService {
    @Autowired
    private FeedbackRepository feedbackRepository;
    @Autowired
    private ContractRepository contractRepository;

    @Override
    @Transactional
    public Feedback createFeedback(Feedback feedback, User user) {
        Contract contract = null;

        // Try to get contract by contractId first
        if (feedback.getContract() != null && feedback.getContract().getContractId() != null) {
            contract = contractRepository.findById(feedback.getContract().getContractId())
                    .orElse(null);
        }

        // If contract not found, try to find by bookingId (if contractId was actually bookingId)
        if (contract == null && feedback.getContract() != null && feedback.getContract().getContractId() != null) {
            contract = contractRepository.findByBookingBookingId(feedback.getContract().getContractId())
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

        feedback.setUser(user);
        feedback.setContract(contract);

        // Validate stars (1-5)
        if (feedback.getStars() == null || feedback.getStars() < 1 || feedback.getStars() > 5) {
            throw new RuntimeException("Stars must be between 1 and 5");
        }

        return feedbackRepository.save(feedback);
    }

    @Override
    public List<Feedback> getUserFeedback(Integer userId) {
        return feedbackRepository.findByUserUserId(userId);
    }

    @Override
    public List<Feedback> getContractFeedback(Integer contractId) {
        return feedbackRepository.findByContractContractId(contractId);
    }
}