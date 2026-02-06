package com.group7.evr.service;

import com.group7.evr.entity.Feedback;
import com.group7.evr.entity.User;

import java.util.List;

public interface FeedbackService {

    public Feedback createFeedback(Feedback feedback, User user);

    public List<Feedback> getUserFeedback(Integer userId);

    public List<Feedback> getContractFeedback(Integer contractId);
}