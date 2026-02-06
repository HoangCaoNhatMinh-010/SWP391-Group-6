package com.group7.evr.service.impl;

import com.group7.evr.entity.Booking;
import com.group7.evr.entity.Complaint;
import com.group7.evr.entity.User;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class EmailTemplateProvider {

    public String buildRegistrationContent(User user, String verificationLink) {
        String name = StringUtils.hasText(user.getName()) ? user.getName() : "bạn";
        return """
                Chào %s,

                Cảm ơn bạn đã đăng ký tài khoản EVR. Để kích hoạt tài khoản, vui lòng xác nhận email của bạn bằng cách nhấp vào liên kết bên dưới:

                %s

                Liên kết sẽ hết hạn sau 24 giờ. Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.

                Trân trọng,
                Đội ngũ EVR
                """.formatted(name, verificationLink);
    }

    public String buildBookingConfirmationContent(Booking booking) {
        String name = booking.getUser() != null && StringUtils.hasText(booking.getUser().getName())
                ? booking.getUser().getName()
                : "bạn";

        String vehicle = booking.getVehicle() != null && booking.getVehicle().getModel() != null
                ? booking.getVehicle().getModel().getModelName()
                : "xe EVR";

        String stationName = booking.getStation() != null && StringUtils.hasText(booking.getStation().getName())
                ? booking.getStation().getName()
                : "trạm EVR";

        String startTime = booking.getStartTime() != null
                ? booking.getStartTime().toString()
                : "đang cập nhật";

        String endTime = booking.getEndTime() != null
                ? booking.getEndTime().toString()
                : "đang cập nhật";

        String totalPrice = booking.getTotalPrice() != null
                ? booking.getTotalPrice().toPlainString()
                : "đang cập nhật";

        return """
                Chào %s,

                EVR đã ghi nhận booking #%d của bạn thành công.

                • Xe: %s
                • Trạm nhận xe: %s
                • Thời gian nhận: %s
                • Thời gian trả: %s
                • Tổng chi phí: %s VND

                Vui lòng chuẩn bị giấy tờ tùy thân khi đến nhận xe. Nếu có bất kỳ thay đổi nào, hãy liên hệ đội ngũ EVR để được hỗ trợ kịp thời.

                Trân trọng,
                Đội ngũ EVR
                """.formatted(
                name,
                booking.getBookingId(),
                vehicle,
                stationName,
                startTime,
                endTime,
                totalPrice
        );
    }

    public String buildBookingDenialContent(Booking booking, String reason) {
        String name = booking.getUser() != null && StringUtils.hasText(booking.getUser().getName())
                ? booking.getUser().getName()
                : "bạn";

        String vehicle = booking.getVehicle() != null && booking.getVehicle().getModel() != null
                ? booking.getVehicle().getModel().getModelName()
                : "xe EVR";

        String stationName = booking.getStation() != null && StringUtils.hasText(booking.getStation().getName())
                ? booking.getStation().getName()
                : "trạm EVR";

        String startTime = booking.getStartTime() != null
                ? booking.getStartTime().toString()
                : "đang cập nhật";

        String reasonText = StringUtils.hasText(reason)
                ? reason
                : "Không đủ điều kiện để thực hiện đặt xe tại thời điểm này.";

        return """
                Chào %s,

                Rất tiếc, booking #%d của bạn đã bị từ chối.

                • Xe: %s
                • Trạm nhận xe: %s
                • Thời gian nhận: %s
                • Lý do: %s

                Nếu bạn có bất kỳ thắc mắc nào về quyết định này, vui lòng liên hệ đội ngũ EVR để được hỗ trợ.

                Trân trọng,
                Đội ngũ EVR
                """.formatted(
                name,
                booking.getBookingId(),
                vehicle,
                stationName,
                startTime,
                reasonText
        );
    }

    public String buildComplaintResponseContent(Complaint complaint) {
        String name = complaint.getUser() != null && StringUtils.hasText(complaint.getUser().getName())
                ? complaint.getUser().getName()
                : "bạn";

        String complaintId = complaint.getComplaintId() != null
                ? String.valueOf(complaint.getComplaintId())
                : "N/A";

        String issueDescription = StringUtils.hasText(complaint.getIssueDescription())
                ? complaint.getIssueDescription()
                : "không có mô tả";

        String adminResponse = StringUtils.hasText(complaint.getAdminResponse())
                ? complaint.getAdminResponse()
                : "Đang xử lý";

        String status = complaint.getStatus() != null
                ? complaint.getStatus().getValue()
                : "Đang xử lý";

        String adminName = complaint.getRespondedByAdmin() != null && StringUtils.hasText(complaint.getRespondedByAdmin().getName())
                ? complaint.getRespondedByAdmin().getName()
                : "Quản trị viên EVR";

        String respondedAt = complaint.getRespondedAt() != null
                ? complaint.getRespondedAt().toString()
                : "vừa xong";

        return """
                Chào %s,

                Chúng tôi đã xem xét khiếu nại #%s của bạn và có phản hồi như sau:

                Khiếu nại của bạn:
                %s

                Phản hồi từ EVR:
                %s

                Trạng thái: %s
                Phản hồi bởi: %s
                Thời gian phản hồi: %s

                Nếu bạn còn bất kỳ thắc mắc nào, vui lòng liên hệ đội ngũ hỗ trợ của chúng tôi.

                Trân trọng,
                Đội ngũ EVR
                """.formatted(
                name,
                complaintId,
                issueDescription,
                adminResponse,
                status,
                adminName,
                respondedAt
        );
    }
}

