-- Fix existing data in database to match Java enum names
-- Run this SQL script directly in your SQL Server database

-- Fix UserRole values
UPDATE Users SET Role = 'CUSTOMER' WHERE Role = 'Customer';
UPDATE Users SET Role = 'STAFF' WHERE Role = 'Staff';
UPDATE Users SET Role = 'ADMIN' WHERE Role = 'Admin';

-- Fix UserStatus values
UPDATE Users SET Status = 'ACTIVE' WHERE Status = 'Active';
UPDATE Users SET Status = 'SUSPENDED' WHERE Status = 'Suspended';
UPDATE Users SET Status = 'DELETED' WHERE Status = 'Deleted';

-- Fix BookingStatus values
UPDATE Booking SET BookingStatus = 'PENDING' WHERE BookingStatus = 'Pending';
UPDATE Booking SET BookingStatus = 'CONFIRMED' WHERE BookingStatus = 'Confirmed';
UPDATE Booking SET BookingStatus = 'CANCELLED' WHERE BookingStatus = 'Cancelled';
UPDATE Booking SET BookingStatus = 'COMPLETED' WHERE BookingStatus = 'Completed';

-- Fix VehicleStatus values
UPDATE Vehicle SET status = 'AVAILABLE' WHERE status = 'Available';
UPDATE Vehicle SET status = 'RENTED' WHERE status = 'Rented';
UPDATE Vehicle SET status = 'MAINTENANCE' WHERE status = 'Maintenance';


