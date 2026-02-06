# Postman API Testing Guide - EVR System

## Base URL
```
http://localhost:8080/api
```

---

## 1. USER APIs

### 1.1 Register User
**POST** `/users/register`
- **Body**: `form-data` or `raw JSON`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0900000004",
  "passwordHash": "password123",
  "address": "District 7",
  "dateOfBirth": "1995-01-01"
}
```

### 1.2 Login
**POST** `/users/login`
- **Body**: `raw JSON`
```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Sample Response:**
```json
{
  "token": "jwt_token_1_...",
  "user": { ... },
  "message": "Login successful"
}
```

### 1.3 Get User by ID
**GET** `/users/{id}`
- Example: `/users/1`

### 1.4 Update User
**PUT** `/users/{id}`
- **Body**: `raw JSON`
```json
{
  "name": "Alice Updated",
  "phone": "0999999999"
}
```

### 1. be Users List (Pagination)
**GET** `/users?page=0&size=10&role=Customer&status=Active`

### 1.6 Get Risk Users
**GET** `/users/risk`

### 1.7 Update User Status
**PUT** `/users/{id}/status?status=Active&reason=Verified`

---

## 2. STATION APIs

### 2.1 Get All Stations
**GET** `/stations`

### 2.2 Get Nearby Stations
**GET** `/stations/nearby?lat=10.775&lng=106.700&radiusDeg=0.02`

### 2.3 Create Station
**POST** `/stations`
- **Body**: `raw JSON`
```json
{
  "name": "West Station",
  "address": "789 West Ave",
  "contactNumber": "0901234567",
  "totalSlots": 40,
  "availableSlots": 40,
  "operatingHours": "08:00-22:00",
  "latitude": 10.800,
  "longitude": 106.750
}
```

### 2.4 Update Station
**PUT** `/stations/{id}`

### 2.5 Delete Station
**DELETE** `/stations/{id}`

---

## 3. VEHICLE APIs

### 3.1 Get Available Vehicles at Station
**GET** `/vehicles/available?stationId=1`

### 3.2 Get Vehicle by ID
**GET** `/vehicles/{id}`

### 3.3 Find Vehicles
**GET** `/vehicles?modelId=1&minBattery=80`

### 3.4 Report Vehicle Issue
**POST** `/vehicles/{id}/report?userId=1&issueCategory=MECHANICAL&priority=HIGH&description=Battery issue`

### 3.5 Create Vehicle
**POST** `/vehicles`
- **Body**: `raw JSON`
```json
{
  "model": { "modelId": 1 },
  "station": { "stationId": 1 },
  "plateNumber": "EV-002",
  "batteryLevel": 85.5,
  "mileage": 1500,
  "status": "Available",
  "lastMaintenanceDate": "2025-01-15"
}
```

### 3.6 Update Vehicle
**PUT** `/vehicles/{id}`

### 3.7 Delete Vehicle
**DELETE** `/vehicles/{id}`

---

## 4. BOOKING APIs

### 4.1 Create Booking
**POST** `/bookings?userId=1`
- **Body**: `raw JSON`
```json
{
  "vehicle": { "vehicleId": 1 },
  "station": { "stationId": 1 },
  "startTime": "2025-01-20",
  "endTime": "2025-01-22",
  "totalPrice": 500000,
  "bookingStatus": "PENDING"
}
```

### 4.2 Get Booking by ID
**GET** `/bookings/{id}`

### 4.3 Check-in Vehicle
**PUT** `/bookings/{id}/checkin?userId=1`
- **Body**: `raw JSON` (staff info)
```json
{
  "userId": 2
}
```

### 4.4 Return Vehicle
**PUT** `/bookings/{id}/return?userId=1`
- **Body**: `raw JSON` (staff info)
```json
{
  "userId": 2
}
```

### 4.5 Get User Booking History
**GET** `/bookings/user?userId=1`

### 4.6 Get User Bookings (Advanced)
**GET** `/bookings/user/1?status=COMPLETED&page=0&size=10`

### 4.7 Get User Analytics
**GET** `/analytics/user?userId=1`

### 4.8 Get Advanced Analytics
**GET** `/analytics/user/advanced?userId=1`

### 4.9 Modify Booking
**PUT** `/bookings/{id}?userId=1`
- **Body**: `raw JSON`
```json
{
  "endTime": "2025-01-23",
  "totalPrice": 600000
}
```

### 4.10 Cancel Booking
**DELETE** `/bookings/{id}?userId=1`

### 4.11 Settlement
**POST** `/bookings/{id}/settlement?userId=1`

---

## 5. ADMIN APIs

Base: `http://localhost:8080/api/admin`

### 5.1 Fleet Summary
**GET** `/fleet/summary?stationId=1`

### 5.2 Dispatch Vehicle
**POST** `/fleet/dispatch?fromStationId=1&toStationId=2&vehicleId=1`

### 5.3 Get Customers
**GET** `/customers`

### 5.4 Flag Customer
**POST** `/customers/{id}/flag?adminId=3&reason=Late returns&riskScore=7`

### 5.5 Get Complaints
**GET** `/complaints?status=Pending`

### 5.6 Get Staff
**GET** `/staff?stationId=1`

### 5.7 Get Staff Performance
**GET** `/staff/{id}/performance`

### 5.8 Create Staff Schedule
**POST** `/staff/schedule?staffId=2&stationId=1&shiftStart=2025-01-20T08:00&shiftEnd=2025-01-20T16:00&shiftType=Morning`

### 5.9 Revenue Report
**GET** `/reports/revenue?stationId=1&from=2025-01-01T00:00&to=2025-01-31T23:59`

### 5.10 Utilization Report
**GET** `/reports/utilization?stationId=1`

### 5.11 Peak Hours Analysis
**GET** `/reports/peaks?stationId=1`

### 5.12 Demand Forecast
**GET** `/reports/forecast?stationId=1`

---

## Sample Data IDs (from data.sql)

- **Users**: 
  - Customer: ID 1 (alice@example.com)
  - Staff: ID 2 (bob.staff@example.com)
  - Admin: ID 3 (carol.admin@example.com)
- **Stations**: ID 1, 2
- **Models**: ID 1 (Tesla Model 3), ID 2 (Yadea G5)
- **Vehicles**: ID 1, 2
- **Bookings**: ID 1

All default password: `password123`

---

## Testing Tips

1. **Start the application** first (`mvn spring-boot:run`)
2. **Import this guide** into Postman
3. **Test in order**: Register → Login → Other APIs
4. **Save responses** in Postman environment variables
5. **Check console** for SQL logs if errors occur


