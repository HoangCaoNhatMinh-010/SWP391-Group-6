package com.group7.evr.service;

import com.group7.evr.entity.Complaint;
import com.group7.evr.entity.User;
import com.group7.evr.enums.ComplaintStatus;

import java.util.List;

public interface ComplaintService {
    Complaint createComplaint(Complaint complaint, User user);

    List<Complaint> getUserComplaints(Integer userId);

    Complaint getComplaintById(Integer id);

    Complaint respondToComplaint(Integer complaintId, String response, ComplaintStatus status, User admin);
}
