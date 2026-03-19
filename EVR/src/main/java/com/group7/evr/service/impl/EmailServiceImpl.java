package com.group7.evr.service.impl;

import com.group7.evr.entity.Booking;
import com.group7.evr.entity.Complaint;
import com.group7.evr.entity.User;
import com.group7.evr.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final EmailTemplateProvider templateProvider;

    @Value("${app.mail.from:no-reply@evr.vn}")
    private String defaultSender;

    @Value("${app.mail.registration-subject:Chào mừng đến EVR}")
    private String registrationSubject;

    @Override
    public void sendRegistrationConfirmation(User user, String verificationLink) {
        if (user == null || !StringUtils.hasText(user.getEmail())) {
            log.warn("Skip sending registration email because user email is missing");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setFrom(defaultSender);
            helper.setSubject(registrationSubject);
            helper.setText(templateProvider.buildRegistrationContent(user, verificationLink), false);

            mailSender.send(message);
            log.info("Sent registration confirmation email to {}", user.getEmail());
        } catch (MailException | MessagingException ex) {
            log.error("Failed to send registration email to {}", user.getEmail(), ex);
        }
    }

    @Value("${app.mail.booking-subject:Xác nhận đặt xe EVR}")
    private String bookingSubject;

    @Override
    public void sendBookingConfirmation(Booking booking) {
        if (booking == null || booking.getUser() == null || !StringUtils.hasText(booking.getUser().getEmail())) {
            log.warn("Skip sending booking confirmation email because user email is missing");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(booking.getUser().getEmail());
            helper.setFrom(defaultSender);
            // Customize subject with booking ID
            String subject = booking.getBookingId() != null 
                ? String.format("Xác nhận đặt xe EVR - Booking #%d", booking.getBookingId())
                : bookingSubject;
            helper.setSubject(subject);
            helper.setText(templateProvider.buildBookingConfirmationContent(booking), false);

            mailSender.send(message);
            log.info("Sent booking confirmation email to {} for booking {}", booking.getUser().getEmail(), booking.getBookingId());
        } catch (MailException | MessagingException ex) {
            log.error("Failed to send booking confirmation email to {}", booking.getUser().getEmail(), ex);
        }
    }

    @Value("${app.mail.booking-denial-subject:Thông báo từ chối đặt xe EVR}")
    private String bookingDenialSubject;

    @Override
    public void sendBookingDenial(Booking booking, String reason) {
        if (booking == null || booking.getUser() == null || !StringUtils.hasText(booking.getUser().getEmail())) {
            log.warn("Skip sending booking denial email because user email is missing");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(booking.getUser().getEmail());
            helper.setFrom(defaultSender);
            helper.setSubject(bookingDenialSubject);
            helper.setText(templateProvider.buildBookingDenialContent(booking, reason), false);

            mailSender.send(message);
            log.info("Sent booking denial email to {} for booking {}", booking.getUser().getEmail(), booking.getBookingId());
        } catch (MailException | MessagingException ex) {
            log.error("Failed to send booking denial email to {}", booking.getUser().getEmail(), ex);
        }
    }

    @Value("${app.mail.complaint-response-subject:Phản hồi khiếu nại từ EVR}")
    private String complaintResponseSubject;

    @Override
    public void sendComplaintResponse(Complaint complaint) {
        if (complaint == null || complaint.getUser() == null || !StringUtils.hasText(complaint.getUser().getEmail())) {
            log.warn("Skip sending complaint response email because user email is missing");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(complaint.getUser().getEmail());
            helper.setFrom(defaultSender);
            helper.setSubject(complaintResponseSubject);
            helper.setText(templateProvider.buildComplaintResponseContent(complaint), false);
            
            mailSender.send(message);
            log.info("Sent complaint response email to {} for complaint {}", complaint.getUser().getEmail(), complaint.getComplaintId());
        } catch (MailException | MessagingException ex) {
            log.error("Failed to send complaint response email to {}", complaint.getUser().getEmail(), ex);
        }
    }

}

