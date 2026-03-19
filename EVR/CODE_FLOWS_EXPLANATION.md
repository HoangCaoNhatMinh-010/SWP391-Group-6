# Giải Thích Tất Cả Các Luồng Code - Hệ Thống EVR (Electric Vehicle Rental)

## 📋 Mục Lục
1. [Kiến Trúc Tổng Quan](#kiến-trúc-tổng-quan)
2. [Luồng Xử Lý Request](#luồng-xử-lý-request)
3. [Các Module Chính](#các-module-chính)
4. [Chi Tiết Luồng Code Theo Chức Năng](#chi-tiết-luồng-code-theo-chức-năng)
5. [Data Flow & Entity Relationships](#data-flow--entity-relationships)

---

## 🏗️ Kiến Trúc Tổng Quan

Hệ thống EVR được xây dựng theo kiến trúc **Spring Boot MVC** với các lớp:

```
┌─────────────────────────────────────────┐
│     Controller Layer (REST API)         │
│  - AdminController                      │
│  - BookingController                     │
│  - UserController                        │
│  - VehicleController                     │
│  - StationController                     │
│  - StaffController                       │
│  - StationStaffController                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Service Layer (Business Logic)    │
│  - AdminService                         │
│  - BookingService                       │
│  - UserService                          │
│  - VehicleService                       │
│  - StationService                       │
│  - StationStaffService                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    Repository Layer (Data Access)      │
│  - JPA Repositories                     │
│  - Custom Query Methods                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Database (SQL Server)          │
└─────────────────────────────────────────┘
```

---

## 🔄 Luồng Xử Lý Request - Chi Tiết Từng Bước

### Quy Trình Chung:
```
1. Client Request (HTTP POST/GET/PUT/DELETE)
   ↓
2. Spring DispatcherServlet nhận request
   ↓
3. Request Mapping: Tìm Controller method phù hợp (@RequestMapping, @GetMapping, @PostMapping)
   ↓
4. Parameter Binding: Spring tự động bind request params/body vào method parameters
   ↓
5. Dependency Injection: Spring inject Service vào Controller (@Autowired)
   ↓
6. Controller method được gọi
   ↓
7. Controller gọi Service layer method
   ↓
8. Service thực hiện business logic:
   - Validate dữ liệu (manual checks)
   - Dependency Injection: Spring inject Repository vào Service
   - Gọi Repository để truy vấn DB
   ↓
9. Repository (JPA) chuyển đổi:
   - JPA method call → SQL query
   - SQL query được thực thi bởi Hibernate/JPA
   ↓
10. Database trả về kết quả (ResultSet)
   ↓
11. Hibernate/JPA map ResultSet → Entity object
   ↓
12. Repository trả về Entity cho Service
   ↓
13. Service xử lý business logic với Entity
   ↓
14. Service có thể gọi lại Repository để save/update
   ↓
15. Service trả về Entity/DTO cho Controller
   ↓
16. Controller tạo ResponseEntity với data
   ↓
17. Spring HttpMessageConverter serialize Entity → JSON/XML
   ↓
18. HTTP Response được gửi về Client
```

### 🔧 Spring Boot Khởi Động:

```
1. EvrApplication.main() được gọi
   ↓
2. SpringApplication.run() khởi động Spring context
   ↓
3. Component Scanning:
   - Scan @SpringBootApplication
   - Tìm tất cả @Component, @Service, @Repository, @Controller
   ↓
4. Dependency Injection Container được tạo:
   - Tạo instance của tất cả @Service, @Repository
   - Inject dependencies (@Autowired)
   ↓
5. JPA/Hibernate khởi động:
   - Đọc application.properties (datasource config)
   - Kết nối database
   - Tạo EntityManagerFactory
   ↓
6. Spring Data JPA tạo proxy cho các Repository interface
   ↓
7. Embedded Tomcat server khởi động (port 8080 mặc định)
   ↓
8. DispatcherServlet được đăng ký để nhận HTTP requests
   ↓
9. Application sẵn sàng nhận requests
```

### 📦 Dependency Injection Hoạt Động Như Thế Nào:

**Ví dụ cụ thể:**
```java
// 1. Controller khai báo dependency
@RestController
public class BookingController {
    @Autowired  // Spring tự động inject instance
    private BookingService bookingService;  // Dependency
    
    // Spring sẽ tìm bean có type = BookingService
    // và inject vào đây khi khởi tạo BookingController
}

// 2. Service được đánh dấu là Spring Bean
@Service  // Spring tạo instance và quản lý
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;  // Dependency
}

// 3. Repository được đánh dấu là Spring Bean
@Repository
public interface BookingRepository extends JpaRepository<...> {
    // Spring Data JPA tự động tạo implementation
}
```

**Khi khởi động:**
```
Spring Boot tạo instance:
1. BookingRepository (proxy từ Spring Data JPA)
2. BookingService → inject BookingRepository vào
3. BookingController → inject BookingService vào
```

### 🔍 JPA Repository Pattern Hoạt Động:

**Ví dụ:**
```java
// Interface Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    // Method name tự động generate query
    List<Booking> findByUserUserId(Integer userId);
}

// Khi gọi: bookingRepository.findByUserUserId(1)
// Spring Data JPA tự động tạo SQL:
// SELECT * FROM Booking WHERE UserID = 1
```

**Cách hoạt động:**
```
1. BookingService gọi: bookingRepository.findByUserUserId(1)
   ↓
2. Spring Data JPA proxy nhận method call
   ↓
3. Parse method name: "findBy" + "User" + "UserId"
   ↓
4. Hiểu: tìm Booking có user.userId = 1
   ↓
5. Tạo JPQL query: "SELECT b FROM Booking b WHERE b.user.userId = :userId"
   ↓
6. Convert JPQL → SQL: "SELECT * FROM Booking WHERE UserID = ?"
   ↓
7. Execute query với parameter = 1
   ↓
8. Hibernate map ResultSet → List<Booking>
   ↓
9. Return List<Booking> cho Service
```

### 🗄️ Database Transaction Hoạt Động:

**Khi Service method được gọi:**
```java
@Service
public class BookingService {
    // Mặc định: @Transactional (readOnly = false)
    public Booking createBooking(...) {
        // BEGIN TRANSACTION (tự động)
        
        Vehicle vehicle = vehicleRepository.findById(...);
        // SELECT query
        
        vehicle.setStatus(VehicleStatus.RENTED);
        vehicleRepository.save(vehicle);
        // UPDATE query (chưa commit)
        
        bookingRepository.save(booking);
        // INSERT query (chưa commit)
        
        // COMMIT TRANSACTION (tự động khi method kết thúc)
        // Nếu có exception → ROLLBACK
    }
}
```

**Transaction Flow:**
```
1. Service method bắt đầu → BEGIN TRANSACTION
2. Mọi database operations trong method cùng 1 transaction
3. Nếu method thành công → COMMIT (lưu tất cả thay đổi)
4. Nếu có exception → ROLLBACK (hủy tất cả thay đổi)
```

---

## 📦 Các Module Chính

### 1. **User Module** (Quản lý người dùng)

**Controller:** `UserController.java`
- Endpoint: `/api/users/*`

**Service:** `UserService.java`

**Chức năng:**
- Đăng ký tài khoản (register)
- Đăng nhập (login)
- Xem/Chỉnh sửa thông tin cá nhân
- Admin quản lý danh sách user
- Xác thực user (verify)

---

### 2. **Booking Module** (Quản lý đặt xe)

**Controller:** `BookingController.java`
- Endpoint: `/api/bookings/*`

**Service:** `BookingService.java`

**Chức năng:**
- Tạo booking mới
- Check-in (nhận xe)
- Return (trả xe)
- Xem lịch sử đặt xe
- Hủy/Chỉnh sửa booking
- Thanh toán (settlement)

---

### 3. **Vehicle Module** (Quản lý xe)

**Controller:** `VehicleController.java`
- Endpoint: `/api/vehicles/*`

**Service:** `VehicleService.java`

**Chức năng:**
- Xem danh sách xe có sẵn
- Báo cáo sự cố xe
- Admin: CRUD xe

---

### 4. **Station Module** (Quản lý trạm)

**Controller:** `StationController.java`
- Endpoint: `/api/stations/*`

**Service:** `StationService.java`

**Chức năng:**
- Xem danh sách trạm
- Tìm trạm gần đây (nearby)
- Admin: CRUD trạm

---

### 5. **Admin Module** (Quản trị hệ thống)

**Controller:** `AdminController.java`
- Endpoint: `/api/admin/*`

**Service:** `AdminService.java`

**Chức năng:**
- Giám sát đội xe (fleet monitoring)
- Điều phối xe (dispatch vehicle)
- Quản lý khách hàng & risk flags
- Quản lý nhân viên & performance
- Báo cáo doanh thu & analytics

---

### 6. **Staff Module** (Nhân viên trạm)

**Controller:** `StationStaffController.java`
- Endpoint: `/api/staff/*`

**Service:** `StationStaffService.java`

**Chức năng:**
- Tạo handover report (bàn giao xe)
- Quản lý bảo trì (maintenance)
- Xác thực khách hàng
- Ghi nhận thanh toán

---

## 🔍 Chi Tiết Luồng Code Theo Chức Năng

### 1. **LUỒNG ĐĂNG KÝ NGƯỜI DÙNG**

```
POST /api/users/register
```

**Luồng xử lý:**

```
UserController.register()
  ↓
UserService.register()
  ├─ Validate dữ liệu
  ├─ Set Role = CUSTOMER
  ├─ Upload file (personalIdImage, licenseImage) nếu có
  ├─ Save user vào DB (UserRepository.save())
  ├─ Log audit: "Registered user {userId}"
  └─ Return User entity
```

**Code flow:**
```java
// Controller
@PostMapping("/users/register")
public ResponseEntity<User> register(...) {
    return ResponseEntity.ok(userService.register(user, personalIdImage, licenseImage));
}

// Service
public User register(User user, MultipartFile personalIdImage, MultipartFile licenseImage) {
    user.setRole(UserRole.CUSTOMER);
    // Upload files
    if (personalIdImage != null) {
        String fileName = saveFile(personalIdImage);
        user.setPersonalIdImage(fileName);
    }
    User savedUser = userRepository.save(user);
    logAudit(savedUser, "Registered user " + savedUser.getUserId());
    return savedUser;
}
```

---

### 2. **LUỒNG ĐĂNG NHẬP**

```
POST /api/users/login
```

**Luồng xử lý:**

```
UserController.login()
  ↓
UserService.login()
  ├─ Tìm user theo email (UserRepository.findByEmail())
  ├─ Validate password (so sánh passwordHash)
  ├─ Check status = ACTIVE
  ├─ Generate JWT token (mock)
  ├─ Sanitize user data (loại bỏ sensitive info)
  ├─ Log audit: "User logged in"
  └─ Return {token, user, message}
```

---

### 3. **LUỒNG TẠO BOOKING - Chi Tiết Từng Bước**

```
POST /api/bookings?userId=1
Body: {
  "vehicle": {"vehicleId": 1},
  "station": {"stationId": 1},
  "startTime": "2025-01-15T10:00:00",
  "endTime": "2025-01-15T12:00:00",
  "totalPrice": 200000
}
```

**Luồng xử lý chi tiết:**

#### Bước 1: HTTP Request đến Server
```
Client gửi: POST http://localhost:8080/api/bookings?userId=1
Headers: Content-Type: application/json
Body: {...}
```

#### Bước 2: Spring DispatcherServlet nhận request
```
DispatcherServlet:
  ├─ Parse URL: "/api/bookings"
  ├─ Parse method: POST
  └─ Tìm Controller method phù hợp
```

#### Bước 3: Request Mapping
```java
@RestController
@RequestMapping("/api")  // Base path
public class BookingController {
    
    @PostMapping("/bookings")  // Path: /api/bookings
    public ResponseEntity<Booking> createBooking(
        @RequestBody Booking booking,        // Spring parse JSON → Booking object
        @RequestParam Integer userId         // Spring lấy ?userId=1
    ) {
        // Method này được gọi
    }
}
```

#### Bước 4: Parameter Binding
```
Spring tự động:
  ├─ Parse JSON body → Booking object
  │   - vehicle.vehicleId = 1
  │   - station.stationId = 1
  │   - startTime = "2025-01-15T10:00:00"
  │   - endTime = "2025-01-15T12:00:00"
  │   - totalPrice = 200000
  └─ Parse query param: userId = 1
```

#### Bước 5: Controller Logic
```java
@PostMapping("/bookings")
public ResponseEntity<Booking> createBooking(
    @RequestBody Booking booking,
    @RequestParam Integer userId
) {
    // 1. Validate user tồn tại
    User user = userService.getUserById(userId);
    // → UserService.getUserById(1)
    
    // 2. Gọi Service để tạo booking
    return ResponseEntity.ok(
        bookingService.createBooking(booking, user)
    );
}
```

#### Bước 6: UserService.getUserById()
```java
public User getUserById(Integer userId) {
    // Gọi Repository
    return userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
    // → JPA tạo SQL: SELECT * FROM Users WHERE UserID = 1
    // → Hibernate map ResultSet → User object
    // → Return User nếu tìm thấy, hoặc throw exception
}
```

#### Bước 7: BookingService.createBooking() - Chi Tiết Từng Dòng

```java
public Booking createBooking(Booking booking, User user) {
    // ═══════════════════════════════════════════════════
    // BƯỚC 7.1: Lấy Vehicle từ Database
    // ═══════════════════════════════════════════════════
    Vehicle vehicle = vehicleRepository.findById(
        booking.getVehicle().getVehicleId()
    ).orElseThrow();
    
    // JPA thực thi:
    // SQL: SELECT * FROM Vehicle WHERE VehicleID = 1
    // → Hibernate map ResultSet → Vehicle object
    // → Nếu không tìm thấy → throw RuntimeException
    
    // ═══════════════════════════════════════════════════
    // BƯỚC 7.2: Validate Vehicle Status
    // ═══════════════════════════════════════════════════
    if (!VehicleStatus.AVAILABLE.equals(vehicle.getStatus())) {
        throw new RuntimeException("Vehicle not available");
    }
    // → Kiểm tra: vehicle.status == "AVAILABLE"
    // → Nếu không → throw exception → HTTP 500 error
    
    // ═══════════════════════════════════════════════════
    // BƯỚC 7.3: Check Time Conflict
    // ═══════════════════════════════════════════════════
    if (hasTimeConflict(booking)) {
        throw new RuntimeException("Booking time conflicts with existing booking");
    }
    
    // hasTimeConflict() thực hiện:
    // 1. Query: bookingRepository.findByVehicleVehicleId(vehicleId)
    //    SQL: SELECT * FROM Booking WHERE VehicleID = 1
    // 2. Lọc các booking không CANCELLED, không COMPLETED
    // 3. Kiểm tra time overlap:
    //    - newBooking.startTime < existingBooking.endTime
    //    - newBooking.endTime > existingBooking.startTime
    // → Nếu overlap → return true → throw exception
    
    // ═══════════════════════════════════════════════════
    // BƯỚC 7.4: Validate Time
    // ═══════════════════════════════════════════════════
    if (booking.getStartTime() != null && booking.getEndTime() != null) {
        if (booking.getStartTime().after(booking.getEndTime())) {
            throw new RuntimeException("Start time cannot be after end time");
        }
    }
    
    // ═══════════════════════════════════════════════════
    // BƯỚC 7.5: Update Vehicle Status
    // ═══════════════════════════════════════════════════
    vehicle.setStatus(VehicleStatus.RENTED);
    vehicleRepository.save(vehicle);
    
    // JPA thực thi:
    // SQL: UPDATE Vehicle SET status = 'RENTED' WHERE VehicleID = 1
    // → Lưu vào transaction (chưa commit)
    
    // ═══════════════════════════════════════════════════
    // BƯỚC 7.6: Setup Booking Object
    // ═══════════════════════════════════════════════════
    booking.setUser(user);  // Set foreign key UserID
    booking.setBookingStatus(BookingStatus.PENDING);  // Set status = "PENDING"
    
    // ═══════════════════════════════════════════════════
    // BƯỚC 7.7: Log Audit
    // ═══════════════════════════════════════════════════
    userService.logAudit(user, "Created booking " + booking.getBookingId());
    
    // logAudit() thực hiện:
    // 1. Tạo AuditLog object
    // 2. Set user, action, timestamp = now()
    // 3. auditLogRepository.save(auditLog)
    //    SQL: INSERT INTO AuditLog (UserID, Action, Timestamp) VALUES (...)
    
    // ═══════════════════════════════════════════════════
    // BƯỚC 7.8: Save Booking
    // ═══════════════════════════════════════════════════
    return bookingRepository.save(booking);
    
    // JPA thực thi:
    // SQL: INSERT INTO Booking (UserID, VehicleID, StationID, StartTime, EndTime, TotalPrice, BookingStatus)
    //      VALUES (1, 1, 1, '2025-01-15 10:00:00', '2025-01-15 12:00:00', 200000, 'PENDING')
    // → Hibernate tự động generate ID
    // → Return Booking object với bookingId mới
}
```

#### Bước 8: Transaction Commit
```
Khi method createBooking() kết thúc thành công:
  → Spring tự động COMMIT transaction
  → Tất cả thay đổi được lưu vào database:
      - Vehicle.status = RENTED
      - Booking mới được insert
      - AuditLog được insert
```

#### Bước 9: Controller Trả Về Response
```java
return ResponseEntity.ok(bookingRepository.save(booking));
// → ResponseEntity.status(200).body(booking)
// → Spring serialize Booking object → JSON
```

#### Bước 10: HTTP Response
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "bookingId": 5,
  "user": {...},
  "vehicle": {...},
  "station": {...},
  "startTime": "2025-01-15T10:00:00",
  "endTime": "2025-01-15T12:00:00",
  "totalPrice": 200000,
  "bookingStatus": "PENDING"
}
```

**Tóm tắt Database Operations:**
```
1. SELECT * FROM Users WHERE UserID = 1
2. SELECT * FROM Vehicle WHERE VehicleID = 1
3. SELECT * FROM Booking WHERE VehicleID = 1  (check conflict)
4. UPDATE Vehicle SET status = 'RENTED' WHERE VehicleID = 1
5. INSERT INTO AuditLog (...) VALUES (...)
6. INSERT INTO Booking (...) VALUES (...)
7. COMMIT (lưu tất cả)
```

---

### 4. **LUỒNG CHECK-IN (Nhận xe)**

```
PUT /api/bookings/{id}/checkin?userId={id}
```

**Luồng xử lý:**

```
BookingController.checkIn()
  ↓
UserService.getUserById() → Validate user
  ↓
BookingService.checkIn()
  ├─ Lấy booking từ DB
  ├─ Set booking.status = CONFIRMED
  ├─ Set booking.staff = staff
  ├─ (Có thể tạo Contract, VehicleConditionReport ở đây)
  ├─ Log audit: "Checked in booking {bookingId}"
  └─ Save booking
```

---

### 5. **LUỒNG RETURN (Trả xe)**

```
PUT /api/bookings/{id}/return?userId={id}
```

**Luồng xử lý:**

```
BookingController.returnVehicle()
  ↓
UserService.getUserById() → Validate user
  ↓
BookingService.returnVehicle()
  ├─ Lấy booking từ DB
  ├─ Set booking.status = COMPLETED
  ├─ Get vehicle từ booking
  ├─ Set vehicle.status = AVAILABLE
  ├─ Save vehicle
  ├─ Log audit: "Returned vehicle for booking {bookingId}"
  └─ Save booking
```

---

### 6. **LUỒNG BÁO CÁO SỰ CỐ XE**

```
POST /api/vehicles/{id}/report?userId={id}&...
```

**Luồng xử lý:**

```
VehicleController.reportVehicleIssue()
  ↓
VehicleService.reportVehicleIssue()
  ├─ Validate vehicle tồn tại
  ├─ Validate user tồn tại
  ├─ Convert issueCategory, priority sang enum
  ├─ Create IssueReport entity
  ├─ Upload photos (nếu có)
  ├─ Set status = OPEN
  ├─ Save issueReport (IssueReportRepository.save())
  ├─ Log audit: "Reported vehicle issue {issueReportId}"
  ├─ Notify station staff (mock notification)
  └─ Return response {issueReportId, status, priority, ...}
```

---

### 7. **LUỒNG ADMIN - GIÁM SÁT ĐỘI XE**

```
GET /api/admin/fleet/summary?stationId={id}
```

**Luồng xử lý:**

```
AdminController.getFleetSummary()
  ↓
AdminService.getFleetSummary()
  ├─ Query vehicles by station và status:
  │   - Available vehicles
  │   - Rented vehicles
  │   - Maintenance vehicles
  ├─ Tính toán:
  │   - totalVehicles
  │   - availableVehicles
  │   - rentedVehicles
  │   - maintenanceVehicles
  │   - occupancyRate
  └─ Return summary map
```

---

### 8. **LUỒNG ADMIN - ĐIỀU PHỐI XE**

```
POST /api/admin/fleet/dispatch?fromStationId={id}&toStationId={id}&vehicleId={id}
```

**Luồng xử lý:**

```
AdminController.dispatchVehicle()
  ↓
AdminService.dispatchVehicle()
  ├─ Lấy vehicle từ DB
  ├─ Validate vehicle đang ở fromStationId
  ├─ Lấy targetStation từ DB
  ├─ Update vehicle.station = targetStation
  ├─ Save vehicle
  ├─ Log audit: "Dispatched vehicle {vehicleId} from station {from} to {to}"
  └─ Return updated vehicle
```

---

### 9. **LUỒNG STAFF - TẠO HANDOVER REPORT**

```
POST /api/staff/handover?staffId={id}&contractId={id}&...
```

**Luồng xử lý:**

```
StationStaffController.createHandover()
  ↓
StationStaffService.createHandoverReport()
  ├─ Validate staff tồn tại
  ├─ Validate contract tồn tại
  ├─ Validate vehicle tồn tại
  ├─ Validate staff.station == vehicle.station (authorization)
  ├─ Create VehicleConditionReport
  ├─ Upload photos (nếu có)
  ├─ Set reportType (PRE_RENTAL hoặc POST_RENTAL)
  ├─ Save report
  ├─ Log audit: "Created {reportType} report for contract {contractId}"
  └─ Return saved report
```

---

### 10. **LUỒNG STAFF - QUẢN LÝ BẢO TRÌ**

```
POST /api/staff/maintenance?staffId={id}&vehicleId={id}&...
```

**Luồng xử lý:**

```
StationStaffController.createMaintenance()
  ↓
StationStaffService.createMaintenance()
  ├─ Validate staff & vehicle tồn tại
  ├─ Validate staff.station == vehicle.station
  ├─ Create Maintenance entity
  ├─ Set status = OPEN
  ├─ Set scheduledAt (nếu có)
  ├─ Save maintenance
  ├─ Log audit: "Created maintenance {maintenanceId}"
  └─ Return saved maintenance
```

---

### 11. **LUỒNG ADMIN - BÁO CÁO DOANH THU**

```
GET /api/admin/reports/revenue?stationId={id}&from={date}&to={date}
```

**Luồng xử lý:**

```
AdminController.getRevenueReport()
  ↓
AdminService.getRevenueReport()
  ├─ Query bookings by station và date range
  ├─ Tính toán:
  │   - totalRevenue (sum totalPrice)
  │   - totalBookings (count)
  │   - averageBookingValue (totalRevenue / count)
  └─ Return report map
```

---

### 12. **LUỒNG ADMIN - PHÂN TÍCH GIỜ CAO ĐIỂM**

```
GET /api/admin/reports/peaks?stationId={id}
```

**Luồng xử lý:**

```
AdminController.getPeakHoursAnalysis()
  ↓
AdminService.getPeakHoursAnalysis()
  ├─ Query bookings by station
  ├─ Group by hour (booking.startTime.getHours())
  ├─ Count bookings per hour
  ├─ Find peak hour (hour với count cao nhất)
  └─ Return {hourlyDistribution, peakHour, totalBookings}
```

---

## 🔗 Data Flow & Entity Relationships

### Entity Relationships:

```
User (1) ──→ (N) Booking
Vehicle (1) ──→ (N) Booking
Station (1) ──→ (N) Booking
User/Staff (1) ──→ (N) Booking

Booking (1) ──→ (1) Contract
Booking (1) ──→ (N) Payment
Booking (1) ──→ (1) Deposit

Contract (1) ──→ (N) Complaint
Contract (1) ──→ (N) Feedback
Contract (1) ──→ (N) VehicleConditionReport

Vehicle (1) ──→ (N) IssueReport
Vehicle (1) ──→ (N) Maintenance

User (1) ──→ (N) RiskFlag
User/Staff (1) ──→ (N) AuditLog
```

### Audit Logging Flow:

Hầu hết các thao tác quan trọng đều được ghi lại trong `AuditLog`:

```
Any Action
  ↓
UserService.logAudit()
  ├─ Create AuditLog entity
  ├─ Set user, action, timestamp
  └─ Save to AuditLogRepository
```

---

## 🎯 Các Luồng Quan Trọng Khác

### **Validation Flow:**

Mỗi service method thường có validation:
1. Validate entity tồn tại (`.orElseThrow()`)
2. Validate business rules (status, permissions)
3. Validate authorization (staff.station == vehicle.station)
4. Validate data constraints (time conflict, duplicate, etc.)

### **Error Handling:**

- Sử dụng `RuntimeException` với message rõ ràng
- Controller tự động trả về HTTP error response
- Có thể bổ sung `@ExceptionHandler` để customize error responses

### **File Upload Flow:**

```
MultipartFile
  ↓
Service.saveFile()
  ├─ Create upload directory path
  ├─ Write file bytes to disk
  └─ Return file path string
  ↓
Save path to Entity (e.g., VehicleConditionReport.photos)
```

---

## 📝 Tóm Tắt Các Luồng Chính

1. **User Management**: Register → Login → View/Update Profile
2. **Booking Lifecycle**: Create → Check-in → Return → Settlement
3. **Vehicle Management**: View available → Report issue → Maintenance
4. **Staff Operations**: Handover → Payment → Maintenance
5. **Admin Dashboard**: Fleet monitoring → Reports → Analytics → Dispatch

---

## 🔐 Security & Authorization Notes

- Hiện tại chưa có JWT authentication thực sự (chỉ mock)
- Authorization check dựa trên station matching (staff phải cùng station với vehicle/booking)
- File upload lưu local (nên chuyển sang S3/cloud storage trong production)

---

## 📚 Tài Liệu Tham Khảo

- File `POSTMAN_API_GUIDE.md` - Danh sách đầy đủ các API endpoints
- File `data.sql` - Seed data mẫu
- File `fix_enums.sql` - Script fix enum values

---

---

## 🎓 Tổng Kết: Cách Code Hoạt Động Tổng Thể

### 1. **Spring Framework Quản Lý Vòng Đời**

```
Application Start
  ↓
Spring Boot khởi tạo Application Context
  ↓
Component Scanning → Tìm tất cả @Component/@Service/@Repository/@Controller
  ↓
Tạo Spring Beans (singleton instances)
  ↓
Dependency Injection → Inject dependencies vào các beans
  ↓
JPA/Hibernate khởi động → Kết nối database
  ↓
Tomcat Server khởi động → Lắng nghe HTTP requests
  ↓
Application Ready
```

### 2. **Mỗi HTTP Request Được Xử Lý Như Sau:**

```
HTTP Request
  ↓
Tomcat Server nhận request
  ↓
Spring DispatcherServlet xử lý
  ↓
Handler Mapping: Tìm Controller method phù hợp
  ↓
Parameter Binding: Parse request → Java objects
  ↓
Controller method được gọi
  ↓
Service method được gọi (dependency injection)
  ↓
Repository method được gọi (dependency injection)
  ↓
JPA/Hibernate tạo SQL query
  ↓
Database thực thi SQL
  ↓
Hibernate map ResultSet → Entity objects
  ↓
Repository trả về Entity
  ↓
Service xử lý business logic
  ↓
Service có thể gọi thêm Repository operations
  ↓
Service trả về result
  ↓
Controller tạo ResponseEntity
  ↓
Spring serialize object → JSON
  ↓
HTTP Response gửi về client
```

### 3. **Dependency Injection Chain:**

```
BookingController
  └─ @Autowired BookingService
      └─ @Autowired BookingRepository
          └─ JPA EntityManager (tự động)
      
      └─ @Autowired UserService
          └─ @Autowired UserRepository
              └─ JPA EntityManager (tự động)
          
          └─ @Autowired AuditLogRepository
              └─ JPA EntityManager (tự động)
```

**Khi BookingController được tạo:**
```
1. Spring tạo BookingController instance
2. Spring tìm BookingService bean → inject vào
3. Spring tìm BookingRepository bean → inject vào BookingService
4. Spring tìm UserService bean → inject vào BookingService
5. Spring tìm UserRepository bean → inject vào UserService
6. Tất cả dependencies đã được inject → Controller sẵn sàng
```

### 4. **JPA Entity Mapping:**

```
Database Table: Booking
  ├─ Column: BookingID → Integer bookingId
  ├─ Column: UserID → @ManyToOne User user
  ├─ Column: VehicleID → @ManyToOne Vehicle vehicle
  ├─ Column: StationID → @ManyToOne Station station
  └─ Column: BookingStatus → @Enumerated BookingStatus bookingStatus
```

**Khi query:**
```
SELECT * FROM Booking WHERE BookingID = 1
  ↓
Hibernate map ResultSet:
  ├─ BookingID = 1 → booking.setBookingId(1)
  ├─ UserID = 5 → Lazy load User: SELECT * FROM Users WHERE UserID = 5
  ├─ VehicleID = 3 → Lazy load Vehicle: SELECT * FROM Vehicle WHERE VehicleID = 3
  └─ BookingStatus = 'PENDING' → booking.setBookingStatus(BookingStatus.PENDING)
  ↓
Return Booking object với đầy đủ relationships
```

### 5. **Transaction Management:**

```
@Transactional (mặc định cho @Service)
  ↓
Method bắt đầu → BEGIN TRANSACTION
  ↓
Mọi database operations trong method:
  ├─ SELECT (không thay đổi data)
  ├─ UPDATE (thay đổi data, chưa commit)
  ├─ INSERT (thêm data, chưa commit)
  └─ DELETE (xóa data, chưa commit)
  ↓
Method kết thúc thành công → COMMIT
  → Tất cả thay đổi được lưu vào database
  ↓
Method throw exception → ROLLBACK
  → Hủy tất cả thay đổi, database không đổi
```

### 6. **Error Handling Flow:**

```
Exception trong Service:
  ↓
RuntimeException được throw
  ↓
Spring không catch → propagate lên Controller
  ↓
Controller không có @ExceptionHandler → propagate lên DispatcherServlet
  ↓
Spring Default Handler:
  ├─ Parse exception message
  ├─ Tạo error response
  └─ Serialize → JSON error response
  ↓
HTTP 500 Internal Server Error
  {
    "timestamp": "...",
    "status": 500,
    "error": "Internal Server Error",
    "message": "Vehicle not available"
  }
```

### 7. **File Upload Flow:**

```
MultipartFile từ HTTP request
  ↓
Spring parse multipart/form-data
  ↓
Controller nhận MultipartFile parameter
  ↓
Service.saveFile() được gọi
  ├─ Create upload directory (uploads/)
  ├─ Write file bytes to disk
  └─ Return file path string
  ↓
Save file path vào Entity field
  ↓
Entity được save → File path lưu vào database
```

### 8. **Audit Logging Pattern:**

```
Mọi thao tác quan trọng:
  ↓
userService.logAudit(user, "Action description")
  ↓
Tạo AuditLog entity:
  ├─ Set user (foreign key)
  ├─ Set action (String)
  ├─ Set timestamp (LocalDateTime.now())
  └─ Save to database
  ↓
Lưu lịch sử hoạt động để tracking
```

---

## 🔑 Các Annotation Quan Trọng Và Cách Hoạt Động

### @RestController
```java
@RestController = @Controller + @ResponseBody
  ├─ Đánh dấu class là Controller
  └─ Tự động serialize return value → JSON
```

### @RequestMapping
```java
@RequestMapping("/api") → Base path cho tất cả methods trong class
@GetMapping("/bookings") → /api/bookings
@PostMapping("/bookings") → /api/bookings
```

### @Autowired
```java
@Autowired → Spring tự động inject dependency
  ├─ Tìm bean có type phù hợp
  ├─ Nếu có nhiều beans → cần @Qualifier
  └─ Inject khi khởi tạo bean
```

### @Service
```java
@Service → Đánh dấu class là Spring Bean (Service layer)
  ├─ Component scanning tìm thấy
  ├─ Tạo singleton instance
  └─ Quản lý bởi Spring Container
```

### @Repository
```java
@Repository → Đánh dấu interface là Spring Bean (Repository layer)
  ├─ Spring Data JPA tạo implementation tự động
  ├─ Xử lý exception translation (SQL → DataAccessException)
  └─ Quản lý bởi Spring Container
```

### @Entity
```java
@Entity → Đánh dấu class là JPA Entity
  ├─ Map class → database table
  ├─ Map fields → columns
  └─ Hibernate quản lý persistence
```

### @ManyToOne / @OneToMany
```java
@ManyToOne → Foreign key relationship
  ├─ Booking.user → Many Bookings to One User
  ├─ Lazy loading (tải khi cần)
  └─ JPA tự động join khi query
```

### @Enumerated
```java
@Enumerated(EnumType.STRING) → Lưu enum value dạng String
  ├─ BookingStatus.PENDING → "PENDING" trong database
  └─ Convert tự động giữa enum ↔ String
```

---

## 📊 Ví Dụ Tổng Hợp: Luồng Hoàn Chỉnh

### Scenario: User đăng ký → Tạo booking → Check-in → Return

#### Bước 1: User Đăng Ký
```
POST /api/users/register
  ↓
UserController.register()
  ↓
UserService.register()
  ├─ Save user → INSERT INTO Users
  └─ Log audit → INSERT INTO AuditLog
  ↓
HTTP 200: User object
```

#### Bước 2: User Tạo Booking
```
POST /api/bookings?userId=1
  ↓
BookingController.createBooking()
  ↓
BookingService.createBooking()
  ├─ Query user: SELECT * FROM Users WHERE UserID = 1
  ├─ Query vehicle: SELECT * FROM Vehicle WHERE VehicleID = 1
  ├─ Validate: vehicle.status = AVAILABLE
  ├─ Check conflict: SELECT * FROM Booking WHERE VehicleID = 1
  ├─ Update vehicle: UPDATE Vehicle SET status = 'RENTED'
  ├─ Log audit: INSERT INTO AuditLog
  └─ Save booking: INSERT INTO Booking
  ↓
COMMIT transaction
  ↓
HTTP 200: Booking object
```

#### Bước 3: User Check-in (Nhận xe)
```
PUT /api/bookings/5/checkin?userId=1
  ↓
BookingController.checkIn()
  ↓
BookingService.checkIn()
  ├─ Query booking: SELECT * FROM Booking WHERE BookingID = 5
  ├─ Update status: UPDATE Booking SET BookingStatus = 'CONFIRMED'
  ├─ Set staff: UPDATE Booking SET StaffID = 2
  └─ Log audit: INSERT INTO AuditLog
  ↓
COMMIT transaction
  ↓
HTTP 200: Updated Booking object
```

#### Bước 4: User Return (Trả xe)
```
PUT /api/bookings/5/return?userId=1
  ↓
BookingController.returnVehicle()
  ↓
BookingService.returnVehicle()
  ├─ Query booking: SELECT * FROM Booking WHERE BookingID = 5
  ├─ Update booking: UPDATE Booking SET BookingStatus = 'COMPLETED'
  ├─ Get vehicle: SELECT * FROM Vehicle WHERE VehicleID = 1
  ├─ Update vehicle: UPDATE Vehicle SET status = 'AVAILABLE'
  └─ Log audit: INSERT INTO AuditLog
  ↓
COMMIT transaction
  ↓
HTTP 200: Completed Booking object
```

**Tổng số database operations:**
- 4 SELECT queries
- 3 UPDATE queries
- 3 INSERT queries (audit logs)
- 3 COMMIT transactions

---

## 🎯 Kết Luận

Hệ thống EVR hoạt động theo mô hình **3-tier architecture**:

1. **Controller Layer**: Nhận HTTP requests, parse parameters, trả về responses
2. **Service Layer**: Xử lý business logic, validation, orchestration
3. **Repository Layer**: Truy cập database, map entities

**Spring Framework** quản lý:
- Dependency Injection
- Component Lifecycle
- Transaction Management
- Request Routing
- Exception Handling

**JPA/Hibernate** quản lý:
- Object-Relational Mapping
- SQL Query Generation
- Transaction Management
- Entity Persistence

**Kết quả**: Code sạch, dễ maintain, scalable, và tuân thủ best practices.

---

**Ghi chú:** Đây là tài liệu giải thích chi tiết về cách code hoạt động. Để hiểu sâu hơn, hãy debug code và xem log của Spring Boot để theo dõi từng bước thực thi.



