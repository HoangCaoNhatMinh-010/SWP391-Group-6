INSERT INTO Station (name, address, contactNumber, totalSlots, AvailableSlots, operatingHours, latitude, longitude)
VALUES
  (N'Chi Nhánh Hải Châu', 
   N'123 Bạch Đằng, Phường Hải Châu 1, Quận Hải Châu, Đà Nẵng', 
   '0236123456', 50, 40, '07:00-22:00', 16.0678, 108.2208),

  (N'Chi Nhánh Thanh Khê', 
   N'456 Điện Biên Phủ, Phường Chính Gián, Quận Thanh Khê, Đà Nẵng', 
   '0236765432', 30, 25, '07:00-22:00', 16.0719, 108.1965),

  (N'Chi Nhánh Sơn Trà', 
   N'789 Ngô Quyền, Phường An Hải Bắc, Quận Sơn Trà, Đà Nẵng', 
   '0236345678', 40, 35, '06:30-22:30', 16.0793, 108.2305),

  (N'Chi Nhánh Liên Chiểu', 
   N'321 Nguyễn Lương Bằng, Phường Hòa Khánh Bắc, Quận Liên Chiểu, Đà Nẵng', 
   '0236987654', 35, 28, '07:00-22:00', 16.0757, 108.1506);

INSERT INTO Model (brand, modelName, vehicleType, basePrice, features)
VALUES
  ('VinFast', 'VF 5 Plus', 'Car', 450000, N'Màn hình cảm ứng 10 inch;Hệ thống hỗ trợ lái ADAS;Sạc nhanh;Kết nối thông minh'),
  ('VinFast', 'VF 6', 'Car', 550000, N'Màn hình cảm ứng 12.9 inch;ADAS nâng cao;Sạc nhanh;Ghế da cao cấp;Cửa sổ trời Panorama'),
  ('VinFast', 'VF 7', 'Car', 650000, N'Màn hình cảm ứng 12.9 inch;ADAS cấp 2;Sạc nhanh DC;Ghế chỉnh điện;Âm thanh 8 loa'),
  ('VinFast', 'VF 8', 'Car', 950000, N'Màn hình cảm ứng 15.6 inch;ADAS cấp 2+;Sạc nhanh DC 150kW;Ghế massage;Âm thanh 11 loa;Cốp điện'),
  ('VinFast', 'VF 9', 'Car', 1350000, N'Màn hình cảm ứng 15.6 inch;ADAS cấp 2+;Sạc nhanh DC 150kW;7 chỗ ngồi;Ghế massage;Âm thanh 13 loa;Cửa sổ trời Panorama;Hệ thống treo khí nén'),
  ('VinFast', 'VF e34', 'Car', 350000, N'Màn hình cảm ứng 10 inch;Hệ thống an toàn cơ bản;Sạc AC;Kết nối Bluetooth');
SET IDENTITY_INSERT Users ON;

INSERT INTO Users (UserID, Address, CreatedAt, DateOfBirth, Email, LicenseImage, Name, PasswordHash, PersonalIdImage, Phone, Role, Status, StationID)
VALUES
(1, N'123 Nguyễn Huệ, Quận 1, TP.HCM', '2024-01-01 08:00:00', '1980-01-15', 'admin@evr.com', NULL, N'Nguyễn Văn An', '$2a$12$yJ8LYmndRx7gLsEJk1epj.ssi/z5aANNF6NMzsXU5YEs181lxXMqy', 'admin_id.jpg', '0901234567', 'Admin', 'Active', NULL),
(2, N'456 Lê Lợi, Quận 1, TP.HCM', '2024-01-02 09:00:00', '1990-03-20', 'tranhung.staff@evr.com', 'tranhung_license.jpg', N'Trần Văn Hùng', '$2a$12$yJ8LYmndRx7gLsEJk1epj.ssi/z5aANNF6NMzsXU5YEs181lxXMqy', 'tranhung_id.jpg', '0912345678', 'Staff', 'Active', 1),
(3, N'789 Hai Bà Trưng, Quận 3, TP.HCM', '2024-01-03 09:00:00', '1992-05-15', 'lethimai.staff@evr.com', 'lethimai_license.jpg', N'Lê Thị Mai', '$2a$12$yJ8LYmndRx7gLsEJk1epj.ssi/z5aANNF6NMzsXU5YEs181lxXMqy', 'lethimai_id.jpg', '0923456789', 'Staff', 'Active', 1),
(4, N'321 Trần Hưng Đạo, Quận 5, TP.HCM', '2024-01-04 09:00:00', '1988-07-10', 'phamhoang.staff@evr.com', 'phamhoang_license.jpg', N'Phạm Văn Hoàng', '$2a$12$yJ8LYmndRx7gLsEJk1epj.ssi/z5aANNF6NMzsXU5YEs181lxXMqy', 'phamhoang_id.jpg', '0934567890', 'Staff', 'Active', 2),
(5, N'654 Võ Văn Tần, Quận 3, TP.HCM', '2024-01-05 09:00:00', '1991-09-25', 'vothilan.staff@evr.com', 'vothilan_license.jpg', N'Võ Thị Lan', '$2a$12$yJ8LYmndRx7gLsEJk1epj.ssi/z5aANNF6NMzsXU5YEs181lxXMqy', 'vothilan_id.jpg', '0945678901', 'Staff', 'Active', 2),
(6, N'147 Pasteur, Quận 1, TP.HCM', '2024-01-06 09:00:00', '1989-11-30', 'hoangminh.staff@evr.com', 'hoangminh_license.jpg', N'Hoàng Văn Minh', '$2a$12$yJ8LYmndRx7gLsEJk1epj.ssi/z5aANNF6NMzsXU5YEs181lxXMqy', 'hoangminh_id.jpg', '0956789012', 'Staff', 'Active', 3),
(7, N'258 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', '2024-01-07 09:00:00', '1993-12-05', 'dothiphuong.staff@evr.com', 'dothiphuong_license.jpg', N'Đỗ Thị Phương', '$2a$12$yJ8LYmndRx7gLsEJk1epj.ssi/z5aANNF6NMzsXU5YEs181lxXMqy', 'dothiphuong_id.jpg', '0967890123', 'Staff', 'Active', 4),
(8, N'369 Lý Thường Kiệt, Quận 10, TP.HCM', '2024-01-10 10:00:00', '1995-02-14', 'nguyenthuy@email.com', 'nguyenthuy_license.jpg', N'Nguyễn Thị Thùy', '$2a$12$yJ8LYmndRx7gLsEJk1epj.ssi/z5aANNF6NMzsXU5YEs181lxXMqy', 'nguyenthuy_id.jpg', '0978901234', 'Customer', 'Active', NULL),
(9, N'741 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', '2024-01-11 10:00:00', '1996-04-20', 'trankien@email.com', 'trankien_license.jpg', N'Trần Văn Kiên', '$2a$12$yJ8LYmndRx7gLsEJk1epj.ssi/z5aANNF6NMzsXU5YEs181lxXMqy', 'trankien_id.jpg', '0989012345', 'Customer', 'Active', NULL),
(10, N'852 Cách Mạng Tháng 8, Quận Tân Bình, TP.HCM', '2024-01-12 10:00:00', '1997-06-15', 'phamhoa@email.com', 'phamhoa_license.jpg', N'Phạm Thị Hoa', '$2a$12$yJ8LYmndRx7gLsEJk1epj.ssi/z5aANNF6NMzsXU5YEs181lxXMqy', 'phamhoa_id.jpg', '0990123456', 'Customer', 'Active', NULL),
(11, N'963 Hoàng Văn Thụ, Quận Phú Nhuận, TP.HCM', '2024-01-13 10:00:00', '1994-08-22', 'leductuan@email.com', 'leductuan_license.jpg', N'Lê Đức Tuấn', '$2a$12$yJ8LYmndRx7gLsEJk1epj.ssi/z5aANNF6NMzsXU5YEs181lxXMqy', 'leductuan_id.jpg', '0901112233', 'Customer', 'Active', NULL),
(12, N'159 Phan Đăng Lưu, Quận Bình Thạnh, TP.HCM', '2024-01-14 10:00:00', '1998-10-18', 'vuthilinh@email.com', 'vuthilinh_license.jpg', N'Vũ Thị Linh', '$2a$12$yJ8LYmndRx7gLsEJk1epj.ssi/z5aANNF6NMzsXU5YEs181lxXMqy', 'vuthilinh_id.jpg', '0912223344', 'Customer', 'Active', NULL),
(13, N'357 Võ Thị Sáu, Quận 3, TP.HCM', '2024-01-15 10:00:00', '1993-03-25', 'buivannam@email.com', 'buivannam_license.jpg', N'Bùi Văn Nam', '$2a$12$yJ8LYmndRx7gLsEJk1epj.ssi/z5aANNF6NMzsXU5YEs181lxXMqy', 'buivannam_id.jpg', '0923334455', 'Customer', 'Suspended', NULL);

SET IDENTITY_INSERT Users OFF;
INSERT INTO Vehicle (ModelID, StationID, plateNumber, batteryLevel, mileage, status, lastMaintenanceDate)
VALUES
  (1, 1, '51A-12345', 90, 1200, 'Available', '2025-01-05'),
  (1, 1, '51B-67890', 85, 800, 'Available', '2025-01-10'),
  (1, 1, '51C-11111', 70, 2500, 'Rented', '2024-12-20'),
  (2, 1, '51D-22222', 95, 500, 'Available', '2025-02-01'),
  (2, 1, '51E-33333', 88, 1500, 'Available', '2025-01-25'),
  (3, 1, '51F-44444', 92, 1000, 'Available', '2025-01-15'),
  (3, 1, '51G-55555', 60, 3000, 'Maintenance', '2025-02-05'),
  (4, 2, '51H-66666', 100, 300, 'Available', '2025-02-08'),
  (4, 2, '51K-77777', 78, 1800, 'Available', '2025-01-20'),
  (4, 2, '51L-88888', 85, 1200, 'Rented', '2025-01-28'),
  (5, 3, '51M-99999', 90, 2000, 'Available', '2025-01-30'),
  (5, 3, '51N-10101', 95, 800, 'Available', '2025-02-03'),
  (6, 4, '51P-12121', 80, 4000, 'Available', '2024-12-15'),
  (6, 4, '51S-13131', 88, 2200, 'Available', '2025-01-18'),
  (6, 4, '51T-14141', 75, 3500, 'Rented', '2025-01-22');
INSERT INTO Booking (UserID, VehicleID, StationID, StaffID, startTime, endTime, totalPrice, BookingStatus)
VALUES
  (8, 1, 1, 2, '2025-01-15 08:00:00', '2025-01-17 18:00:00', 2700000, 'Completed'),
  (9, 4, 1, 3, '2025-01-20 09:00:00', '2025-01-22 17:00:00', 3300000, 'Completed'),
  (10, 3, 1, 2, '2025-02-10 07:00:00', '2025-02-12 19:00:00', 3900000, 'Confirmed'),
  (11, 10, 2, 4, '2025-02-11 10:00:00', '2025-02-13 10:00:00', 3800000, 'Confirmed'),
  (12, 11, 3, 6, '2025-01-25 08:30:00', '2025-01-28 20:00:00', 8100000, 'Completed'),
  (13, 15, 4, 7, '2025-02-09 06:00:00', '2025-02-14 18:00:00', 3150000, 'Confirmed'),
  (8, 5, 1, 3, '2025-02-15 09:00:00', '2025-02-18 17:00:00', 3300000, 'Pending'),
  (9, 8, 2, 5, '2025-02-16 08:00:00', '2025-02-19 20:00:00', 5700000, 'Pending'),
  (10, 6, 1, 2, '2025-01-10 10:00:00', '2025-01-13 18:00:00', 3900000, 'Cancelled'),
  (11, 13, 4, 7, '2025-01-05 07:00:00', '2025-01-08 19:00:00', 2100000, 'Completed');
INSERT INTO Contract (BookingID, renterSignature, staffSignature, signedAt, status)
VALUES
  (1, N'Chữ ký Nguyễn Thị Thùy', N'Chữ ký Trần Văn Hùng', '2025-01-15 08:00:00', 'Completed'),
  (2, N'Chữ ký Trần Văn Kiên', N'Chữ ký Lê Thị Mai', '2025-01-20 09:00:00', 'Completed'),
  (3, N'Chữ ký Phạm Thị Hoa', N'Chữ ký Trần Văn Hùng', '2025-02-10 07:00:00', 'Active'),
  (4, N'Chữ ký Lê Đức Tuấn', N'Chữ ký Phạm Văn Hoàng', '2025-02-11 10:00:00', 'Active'),
  (5, N'Chữ ký Vũ Thị Linh', N'Chữ ký Hoàng Văn Minh', '2025-01-25 08:30:00', 'Completed'),
  (6, N'Chữ ký Bùi Văn Nam', N'Chữ ký Đỗ Thị Phương', '2025-02-09 06:00:00', 'Active'),
  (10, N'Chữ ký Lê Đức Tuấn', N'Chữ ký Đỗ Thị Phương', '2025-01-05 07:00:00', 'Completed');
INSERT INTO Payment (BookingID, method, amount, paymentDate, status)
VALUES
  (1, 'E_WALLET', 2700000, '2025-01-15 08:00:00', 'SUCCESS'),
  (2, 'CARD', 3300000, '2025-01-20 09:00:00', 'SUCCESS'),
  (3, 'E_WALLET', 3900000, '2025-02-10 07:00:00', 'SUCCESS'),
  (4, 'CARD', 3800000, '2025-02-11 10:00:00', 'SUCCESS'),
  (5, 'CARD', 8100000, '2025-01-25 08:30:00', 'SUCCESS'),
  (6, 'CASH', 3150000, '2025-02-09 06:00:00', 'SUCCESS'),
  (7, 'E_WALLET', 1650000, '2025-02-15 09:00:00', 'PENDING');
INSERT INTO Complaint (ContractID, UserID, StaffID, issueDescription, createdAt, status)
VALUES
  (1, 8, 2, N'Xe có vết trầy xước nhỏ ở cửa sau bên trái', '2025-01-15 08:30:00', 'RESOLVED'),
  (2, 9, 3, N'Giao xe chậm 30 phút so với giờ hẹn', '2025-01-20 09:30:00', 'RESOLVED'),
  (3, 10, 2, N'Pin xe không đủ 100% như cam kết', '2025-02-10 07:30:00', 'PENDING'),
  (5, 12, 6, N'Hệ thống điều hòa không hoạt động tốt', '2025-01-25 10:00:00', 'RESOLVED'),
  (7, 11, 7, N'Nội thất xe chưa được vệ sinh sạch sẽ', '2025-01-05 08:00:00', 'RESOLVED');
INSERT INTO Feedback (ContractID, UserID, category, stars, comment, createdAt)
VALUES
  (1, 8, 'SERVICE', 5, N'Dịch vụ tuyệt vời, nhân viên nhiệt tình. Xe chạy êm và tiết kiệm pin.', '2025-01-17 18:30:00'),
  (2, 9, 'VEHICLE', 4, N'Xe đẹp và hiện đại, tuy nhiên giao xe hơi chậm.', '2025-01-22 17:30:00'),
  (5, 12, 'SERVICE', 5, N'Rất hài lòng với dịch vụ thuê xe. Sẽ quay lại lần sau!', '2025-01-28 20:30:00'),
  (7, 11, 'SERVICE', 3, N'Xe hơi bẩn, cần vệ sinh kỹ hơn trước khi giao cho khách.', '2025-01-08 19:30:00'),
  (1, 8, 'VEHICLE', 5, N'Xe được bảo dưỡng tốt, không có vấn đề gì.', '2025-01-17 19:00:00');
INSERT INTO IssueReport (VehicleID, UserID, StationID, issueCategory, priority, description, photos, status, reportedAt)
VALUES
  (1, 8, 1, 'mechanical', 'LOW', N'Có tiếng kêu nhẹ ở động cơ khi tăng tốc', '["issue_51a12345_1.jpg","issue_51a12345_2.jpg"]', 'RESOLVED', '2025-01-16 14:00:00'),
  (4, 9, 1, 'electrical', 'MEDIUM', N'Pin sụt nhanh hơn bình thường, chỉ chạy được 200km thay vì 300km', '["issue_51d22222_1.jpg"]', 'OPEN', '2025-01-21 11:00:00'),
  (10, 11, 2, 'cosmetic', 'LOW', N'Nội thất bẩn, có vết bẩn trên ghế sau', '[]', 'RESOLVED', '2025-02-11 11:30:00'),
  (11, 12, 3, 'electrical', 'HIGH', N'Hệ thống điều hòa không hoạt động', '["issue_51m99999_1.jpg"]', 'RESOLVED', '2025-01-26 09:00:00'),
  (15, 13, 4, 'mechanical', 'MEDIUM', N'Phanh hơi mềm, cần kiểm tra', '["issue_51t14141_1.jpg"]', 'OPEN', '2025-02-10 08:00:00');
INSERT INTO Maintenance (VehicleID, StationID, StaffID, issueDescription, status, scheduledAt, closedAt, remarks)
VALUES
  (1, 1, 2, N'Kiểm tra tiếng động cơ bất thường', 'Closed', '2025-01-17 08:00:00', '2025-01-17 10:30:00', N'Đã bôi trơn các bộ phận, tiếng động đã hết'),
  (4, 1, 3, N'Kiểm tra sức khỏe pin, cân bằng cell pin', 'IN_PROGRESS', '2025-02-12 09:00:00', NULL, N'Đang chờ thiết bị kiểm tra chuyên dụng'),
  (7, 1, 2, N'Bảo dưỡng định kỳ 3000km', 'Closed', '2025-02-05 08:00:00', '2025-02-05 16:00:00', N'Đã thay dầu phanh, kiểm tra toàn bộ hệ thống'),
  (10, 2, 4, N'Vệ sinh nội thất và ngoại thất', 'Closed', '2025-02-11 14:00:00', '2025-02-11 16:00:00', N'Đã vệ sinh sạch sẽ'),
  (11, 3, 6, N'Sửa chữa hệ thống điều hòa', 'Closed', '2025-01-27 08:00:00', '2025-01-27 15:00:00', N'Đã thay gas điều hòa và kiểm tra compressor'),
  (15, 4, 7, N'Kiểm tra và điều chỉnh hệ thống phanh', 'Open', '2025-02-13 09:00:00', NULL, N'Đã đặt lịch bảo trì');
INSERT INTO VehicleConditionReport (ContractID, VehicleID, StaffID, reportTime, battery, damageDescription, photos, ReportType)
VALUES
  (1, 1, 2, '2025-01-15 07:45:00', 90, N'Xe trong tình trạng tốt, không có hư hỏng', '["vcr_51a12345_pre_1.jpg","vcr_51a12345_pre_2.jpg"]', 'PRE_RENTAL'),
  (2, 4, 3, '2025-01-20 08:45:00', 95, N'Xe hoàn hảo, mới bảo dưỡng', '["vcr_51d22222_pre_1.jpg"]', 'PRE_RENTAL'),
  (3, 3, 2, '2025-02-10 06:45:00', 92, N'Xe tốt, pin đầy', '["vcr_51c11111_pre_1.jpg"]', 'PRE_RENTAL'),
  (4, 10, 4, '2025-02-11 09:45:00', 85, N'Xe trong tình trạng tốt', '["vcr_51l88888_pre_1.jpg"]', 'PRE_RENTAL'),
  (5, 11, 6, '2025-01-25 08:15:00', 90, N'Xe hoàn hảo', '["vcr_51m99999_pre_1.jpg"]', 'PRE_RENTAL'),

  (1, 1, 2, '2025-01-17 18:15:00', 35, N'Vết trầy nhỏ ở cửa sau trái, pin còn 35%', '["vcr_51a12345_post_1.jpg","vcr_51a12345_post_2.jpg"]', 'POST_RENTAL'),
  (2, 4, 3, '2025-01-22 17:15:00', 40, N'Xe sạch sẽ, không có hư hỏng mới', '["vcr_51d22222_post_1.jpg"]', 'POST_RENTAL'),
  (5, 11, 6, '2025-01-28 20:15:00', 25, N'Hệ thống điều hòa có vấn đề', '["vcr_51m99999_post_1.jpg"]', 'POST_RENTAL'),
  (7, 15, 7, '2025-01-08 19:15:00', 48, N'Nội thất bẩn, cần vệ sinh', '["vcr_51t14141_post_1.jpg"]', 'POST_RENTAL');
INSERT INTO AuditLog (action, timestamp, UserID)
VALUES
  ('LOGIN', '2025-01-01 08:00:00', 1),
  ('CREATE', '2025-01-02 09:15:00', 2),
  ('UPDATE', '2025-01-03 10:30:00', 3),
  ('DELETE', '2025-01-04 11:45:00', 4),
  ('LOGOUT', '2025-01-05 12:00:00', 1),
  ('VIEW', '2025-01-06 13:20:00', 5),
  ('LOGIN', '2025-01-07 08:05:00', 6),
  ('UPDATE', '2025-01-08 14:00:00', 7),
  ('CREATE', '2025-01-09 15:15:00', 8),
  ('LOGOUT', '2025-01-10 16:30:00', 9);


