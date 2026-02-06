package com.group7.evr.service;

import com.group7.evr.entity.Booking;
import com.group7.evr.entity.Complaint;
import com.group7.evr.entity.User;

public interface EmailService {

    /**
     * Send registration confirmation email to the given user.
     *
     * @param user the user who has just registered
     */
    void sendRegistrationConfirmation(User user, String verificationLink);

    /**
     * Send booking confirmation email after a booking is created.
     *
     * @param booking the booking to include in the email
     */
    void sendBookingConfirmation(Booking booking);

    /**
     * Send booking denial notification email to the customer.
     *
     * @param booking the denied booking
     * @param reason the reason for denial (optional)
     */
    void sendBookingDenial(Booking booking, String reason);

    /**
     * Send complaint response email to the customer.
     *
     * @param complaint the complaint with admin response
     */
    void sendComplaintResponse(Complaint complaint);
}

