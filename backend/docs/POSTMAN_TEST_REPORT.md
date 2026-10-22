# TechNeest Backend — Actual API & Unit Testing Report

- **Executed At**: `2026-10-22T16:35:52.069Z`
- **Test Runner**: Automated Node.js HTTP & Unit Test Suite (`backend/tests/runTests.js` & `backend/tests/unit.test.js`) against live Express app and MongoDB v8.0.16 instance.
- **Unit Tests**: **8 / 8 Passed**
- **Integration HTTP Tests**: **53 / 53 Passed**
- **SMTP Integration Note**: Live external SMTP email transmission is gracefully marked as **Pending / Skipped (Unconfigured)** because `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASSWORD` are not populated in `.env`. The backend verified its non-crashing fallback behavior and logged the pending attempts in `EmailLog`.

---

## Part 1 — Automated Unit Tests (`backend/tests/unit.test.js`)

| # | Test Scenario | Status |
|---|---|---|
| 1 | UTC to Asia/Kolkata (+05:30) date/time conversion across midnight boundary | **PASS** |
| 2 | Month boundary calendar calculation (February leap vs non-leap & October 31 days) | **PASS** |
| 3 | Attendance: On-time check-in (09:10 AM IST) and full-day check-out (06:05 PM IST) | **PASS** |
| 4 | Attendance: Late arrival detection after grace period (09:48 AM IST) | **PASS** |
| 5 | Attendance: Half-day & early checkout detection (4h 30m worked) | **PASS** |
| 6 | Payroll: Full attendance (24/24 working days) with Bonus (+2000) & Deduction (-1000) | **PASS** |
| 7 | Payroll: Proration with Half-Days, Paid Leave, Unpaid Leave, Statutory PF/PT, and INR Rounding | **PASS** |
| 8 | PDF Generator: Generates valid PDF binary buffer with header and EOF trailer | **PASS** |

---

## Part 2 — Summary Table of Live HTTP Integration Tests (`backend/tests/runTests.js`)

| # | Method & Endpoint | Test Scenario | HTTP Status | Result | Remaining Issue |
|---|---|---|---|---|---|
| 1 | `GET /api/health` | Verify server & MongoDB connection health | `200` | **PASS** | None |
| 2 | `POST /api/v1/admin/auth/setup` | Bootstrap initial super_admin account | `201` | **PASS** | None |
| 3 | `POST /api/v1/admin/auth/setup` | Verify second setup call is blocked when admin already exists | `403` | **PASS** | None |
| 4 | `POST /api/v1/admin/auth/login` | Invalid email format triggers 400 validation error | `400` | **PASS** | None |
| 5 | `POST /api/v1/admin/auth/login` | Wrong password returns 401 and records failed LoginHistory | `401` | **PASS** | None |
| 6 | `POST /api/v1/admin/auth/login` | Valid admin credentials return JWT access & refresh tokens | `200` | **PASS** | None |
| 7 | `GET /api/v1/admin/auth/profile` | Fetch authenticated admin profile | `200` | **PASS** | None |
| 8 | `POST /api/v1/admin/auth/refresh` | Rotate refresh token and issue new token pair | `200` | **PASS** | None |
| 9 | `POST /api/v1/admin/departments` | Create Development department | `201` | **PASS** | None |
| 10 | `POST /api/v1/admin/employees` | Create employee Rahul Sharma with baseSalary 45000 | `201` | **PASS** | None |
| 11 | `POST /api/v1/admin/employees` | Create second employee Priya Verma for data isolation testing | `201` | **PASS** | None |
| 12 | `GET /api/v1/admin/employees?page=1&limit=10&search=Rahul` | Paginated employee list with search filter | `200` | **PASS** | None |
| 13 | `GET /api/v1/admin/employees/WB-024` | Fetch employee profile, task stats, and monthly attendance calendar | `200` | **PASS** | None |
| 14 | `PUT /api/v1/admin/employees/WB-024` | Update employee phone and designation | `200` | **PASS** | None |
| 15 | `POST /api/v1/employee/auth/login` | Employee logs in; records LoginHistory in UTC & Asia/Kolkata without auto-creating approved attendance | `200` | **PASS** | None |
| 16 | `POST /api/v1/employee/auth/login` | Second employee logs in | `200` | **PASS** | None |
| 17 | `GET /api/v1/admin/employees` | Employee token attempting to access Admin route is rejected with 403 | `403` | **PASS** | None |
| 18 | `GET /api/v1/admin/attendance/register?employeeId=WB-024` | Official AttendanceRegister has 0 records immediately after login before check-in & admin approval | `200` | **PASS** | None |
| 19 | `GET /api/v1/admin/activity/login-history?employeeId=WB-024` | Verify login date, time, IP, and device metadata recorded | `200` | **PASS** | None |
| 20 | `GET /api/v1/admin/activity/active-sessions` | List currently active employee sessions with duration | `200` | **PASS** | None |
| 21 | `POST /api/v1/employee/attendance/check-in` | Employee marks check-in; creates Pending attendance record | `201` | **PASS** | None |
| 22 | `POST /api/v1/employee/attendance/check-in` | Second check-in on the same date is rejected with 409 | `409` | **PASS** | None |
| 23 | `POST /api/v1/employee/attendance/check-out` | Employee checks out; duration calculated and status stays Pending approval | `200` | **PASS** | None |
| 24 | `POST /api/v1/employee/attendance/6ada3b66c2a389171d9e3cdb/correction-request` | Employee submits correction request with full 9h shift timestamps | `200` | **PASS** | None |
| 25 | `GET /api/v1/admin/attendance/pending` | Admin lists pending / correction-requested attendance records | `200` | **PASS** | None |
| 26 | `PATCH /api/v1/admin/attendance/6ada3b66c2a389171d9e3cdb/review` | Admin approves attendance; transfers to official AttendanceRegister and updates employee summary | `200` | **PASS** | None |
| 27 | `GET /api/v1/admin/attendance/register?employeeId=WB-024` | Verify approved attendance is now in official AttendanceRegister without duplicates | `200` | **PASS** | None |
| 28 | `GET /api/v1/admin/attendance/audit-logs?employeeId=WB-024` | Verify permanent audit trail of CHECK_IN, CHECK_OUT, CORRECTION_REQUESTED, and CORRECTION_APPROVED | `200` | **PASS** | None |
| 29 | `POST /api/v1/admin/attendance/manual-adjustment` | Set totalWorkingDays=24 and adjust WB-024 presentDays=22 for October 2026 | `200` | **PASS** | None |
| 30 | `POST /api/v1/employee/leaves` | Employee WB-024 applies for 2 days Casual Leave | `201` | **PASS** | None |
| 31 | `PATCH /api/v1/admin/leaves/6ada3b66c2a389171d9e3cf6/review` | Admin approves 2 paid leave days for WB-024 | `200` | **PASS** | None |
| 32 | `POST /api/v1/admin/payroll/run` | Calculate draft payroll for October 2026 using approved attendance and leaves | `200` | **PASS** | None |
| 33 | `POST /api/v1/admin/payroll/6ada3b673bbfd4bbed8468e7/adjustments` | Add INR 2,000 Festival Bonus and recalculate before finalization | `200` | **PASS** | None |
| 34 | `PATCH /api/v1/admin/payroll/6ada3b673bbfd4bbed8468e7/approve` | Admin approves payroll; workflowStatus becomes Approved while paymentStatus stays Pending | `200` | **PASS** | None |
| 35 | `PATCH /api/v1/admin/payroll/6ada3b673bbfd4bbed8468e7/finalize` | Finalize payroll, lock immutable snapshot, generate PDF payslip, and log SMTP state | `200` | **PASS** | None |
| 36 | `POST /api/v1/admin/payroll/6ada3b673bbfd4bbed8468e7/adjustments` | Adding adjustment to Finalized immutable payroll is blocked with 400 | `400` | **PASS** | None |
| 37 | `PATCH /api/v1/admin/payroll/6ada3b673bbfd4bbed8468e7/payment-status` | Mark finalized payroll as Paid with bank reference number | `200` | **PASS** | None |
| 38 | `GET /api/v1/employee/payslips/6ada3b673bbfd4bbed8468e8/download` | Employee WB-024 downloads their own generated PDF salary slip | `200` | **PASS** | None |
| 39 | `GET /api/v1/employee/payslips/6ada3b673bbfd4bbed8468e8/download` | Employee WB-019 attempting to download WB-024's payslip is rejected with 403 | `403` | **PASS** | None |
| 40 | `POST /api/v1/admin/payroll/payslips/6ada3b673bbfd4bbed8468e8/resend-email` | Admin triggers payslip resend; preserves Pending state with warning when SMTP unconfigured | `200` | **PASS** | None |
| 41 | `GET /api/v1/admin/payroll/email-logs` | Verify EmailLog records delivery attempts | `200` | **PASS** | None |
| 42 | `POST /api/v1/admin/tasks` | Admin assigns task to Rahul Sharma | `201` | **PASS** | None |
| 43 | `POST /api/v1/employee/tasks` | Employee creates a personal task on /create-task | `201` | **PASS** | None |
| 44 | `PATCH /api/v1/employee/tasks/6ada3b67c2a389171d9e3d04` | Employee marks assigned task as Completed | `200` | **PASS** | None |
| 45 | `GET /api/v1/admin/dashboard` | Fetch Admin Dashboard cards, sidebar stats, recent team activity, and attendance overview | `200` | **PASS** | None |
| 46 | `GET /api/v1/admin/reports` | Fetch team performance report and weekly task chart | `200` | **PASS** | None |
| 47 | `GET /api/v1/admin/departments` | Fetch departments with team size and task completion rate | `200` | **PASS** | None |
| 48 | `PUT /api/v1/admin/settings` | Update standard login/logout times and toggles | `200` | **PASS** | None |
| 49 | `GET /api/v1/admin/audit-logs` | Fetch security and administrative audit logs | `200` | **PASS** | None |
| 50 | `GET /api/v1/employee/dashboard` | Fetch employee dashboard stats, priority tasks, and today's attendance | `200` | **PASS** | None |
| 51 | `GET /api/v1/employee/reports-profile` | Fetch employee weekly productivity chart, profile, and recently completed tasks | `200` | **PASS** | None |
| 52 | `POST /api/v1/employee/auth/logout` | Employee logs out; records logoutTimestampUTC and sessionDurationMinutes | `200` | **PASS** | None |
| 53 | `POST /api/v1/admin/auth/logout` | Admin logs out and invalidates session | `200` | **PASS** | None |

---

## Part 3 — Actual Sanitized HTTP Responses

### Test 1: System Health Check
- **Endpoint**: `GET /api/health`
- **Scenario**: Verify server & MongoDB connection health
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "System health status",
  "data": {
    "database": "connected",
    "smtpConfigured": false,
    "timezone": "Asia/Kolkata",
    "timestamp": "2026-10-22T16:35:44.266Z"
  }
}
```

### Test 2: Initial Admin Setup
- **Endpoint**: `POST /api/v1/admin/auth/setup`
- **Scenario**: Bootstrap initial super_admin account
- **HTTP Status**: `201` (Expected: `201`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Initial administrator account configured successfully",
  "data": {
    "admin": {
      "fullName": "Vikram Admin",
      "email": "admin@workboard.com",
      "role": "super_admin",
      "roleRef": "6ada3b60c2a389171d9e3cc5",
      "permissions": [
        "dashboard:view",
        "employees:read",
        "employees:write",
        "employees:delete",
        "departments:read",
        "departments:write",
        "tasks:read",
        "tasks:write",
        "attendance:read",
        "attendance:approve",
        "attendance:adjust",
        "leaves:read",
        "leaves:approve",
        "holidays:manage",
        "payroll:read",
        "payroll:run",
        "payroll:approve",
        "payroll:finalize",
        "payslips:manage",
        "reports:view",
        "settings:manage",
        "roles:manage",
        "audit:read"
      ],
      "status": "Active",
      "failedLoginAttempts": 0,
      "lockUntil": null,
      "lastLoginAt": null,
      "lastLoginIp": null,
      "lastLoginDevice": null,
      "passwordChangedAt": null,
      "_id": "6ada3b62c2a389171d9e3cc6",
      "createdAt": "2026-10-22T16:35:46.050Z",
      "updatedAt": "2026-10-22T16:35:46.050Z"
    }
  }
}
```

### Test 3: Duplicate Admin Setup Blocked
- **Endpoint**: `POST /api/v1/admin/auth/setup`
- **Scenario**: Verify second setup call is blocked when admin already exists
- **HTTP Status**: `403` (Expected: `403`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": false,
  "message": "Initial admin setup is locked because an administrator account already exists."
}
```

### Test 4: Admin Login Validation Failure
- **Endpoint**: `POST /api/v1/admin/auth/login`
- **Scenario**: Invalid email format triggers 400 validation error
- **HTTP Status**: `400` (Expected: `400`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    },
    {
      "field": "password",
      "message": "Password is required"
    }
  ]
}
```

### Test 5: Admin Login Invalid Password
- **Endpoint**: `POST /api/v1/admin/auth/login`
- **Scenario**: Wrong password returns 401 and records failed LoginHistory
- **HTTP Status**: `401` (Expected: `401`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": false,
  "message": "Invalid Credentials. Please check your email and password."
}
```

### Test 6: Admin Login Success
- **Endpoint**: `POST /api/v1/admin/auth/login`
- **Scenario**: Valid admin credentials return JWT access & refresh tokens
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "data": {
    "admin": {
      "_id": "6ada3b62c2a389171d9e3cc6",
      "fullName": "Vikram Admin",
      "email": "admin@workboard.com",
      "role": "super_admin",
      "roleRef": "6ada3b60c2a389171d9e3cc5",
      "permissions": [
        "dashboard:view",
        "employees:read",
        "employees:write",
        "employees:delete",
        "departments:read",
        "departments:write",
        "tasks:read",
        "tasks:write",
        "attendance:read",
        "attendance:approve",
        "attendance:adjust",
        "leaves:read",
        "leaves:approve",
        "holidays:manage",
        "payroll:read",
        "payroll:run",
        "payroll:approve",
        "payroll:finalize",
        "payslips:manage",
        "reports:view",
        "settings:manage",
        "roles:manage",
        "audit:read"
      ],
      "status": "Active",
      "failedLoginAttempts": 0,
      "lockUntil": null,
      "lastLoginAt": "2026-10-22T16:35:46.673Z",
      "lastLoginIp": "127.0.0.1",
      "lastLoginDevice": "Unknown Browser on Unknown OS",
      "passwordChangedAt": null,
      "createdAt": "2026-10-22T16:35:46.050Z",
      "updatedAt": "2026-10-22T16:35:46.953Z"
    },
    "accessToken": "<REDACTED_JWT_TOKEN>",
    "refreshToken": "<REDACTED_JWT_TOKEN>",
    "sessionId": "a20bd3d8-05eb-4b1e-97b7-c3208596ae4d",
    "expiresAt": "2026-11-21T16:35:47.320Z",
    "lastLoginAt": null,
    "ipAddress": "127.0.0.1",
    "deviceInfo": {
      "browser": "Unknown Browser",
      "os": "Unknown OS",
      "deviceType": "Desktop",
      "raw": "Techneest-HTTP-TestRunner/1.0 (macOS)"
    }
  }
}
```

### Test 7: Get Admin Profile
- **Endpoint**: `GET /api/v1/admin/auth/profile`
- **Scenario**: Fetch authenticated admin profile
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Admin profile fetched successfully",
  "data": {
    "admin": {
      "_id": "6ada3b62c2a389171d9e3cc6",
      "fullName": "Vikram Admin",
      "email": "admin@workboard.com",
      "role": "super_admin",
      "roleRef": "6ada3b60c2a389171d9e3cc5",
      "permissions": [
        "dashboard:view",
        "employees:read",
        "employees:write",
        "employees:delete",
        "departments:read",
        "departments:write",
        "tasks:read",
        "tasks:write",
        "attendance:read",
        "attendance:approve",
        "attendance:adjust",
        "leaves:read",
        "leaves:approve",
        "holidays:manage",
        "payroll:read",
        "payroll:run",
        "payroll:approve",
        "payroll:finalize",
        "payslips:manage",
        "reports:view",
        "settings:manage",
        "roles:manage",
        "audit:read"
      ],
      "status": "Active",
      "failedLoginAttempts": 0,
      "lockUntil": null,
      "lastLoginAt": "2026-10-22T16:35:46.673Z",
      "lastLoginIp": "127.0.0.1",
      "lastLoginDevice": "Unknown Browser on Unknown OS",
      "passwordChangedAt": null,
      "createdAt": "2026-10-22T16:35:46.050Z",
      "updatedAt": "2026-10-22T16:35:46.953Z"
    },
    "currentSessionId": "a20bd3d8-05eb-4b1e-97b7-c3208596ae4d"
  }
}
```

### Test 8: Admin Refresh Token Rotation
- **Endpoint**: `POST /api/v1/admin/auth/refresh`
- **Scenario**: Rotate refresh token and issue new token pair
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "<REDACTED_JWT_TOKEN>",
    "refreshToken": "<REDACTED_JWT_TOKEN>",
    "sessionId": "a20bd3d8-05eb-4b1e-97b7-c3208596ae4d"
  }
}
```

### Test 9: Create Department
- **Endpoint**: `POST /api/v1/admin/departments`
- **Scenario**: Create Development department
- **HTTP Status**: `201` (Expected: `201`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "name": "Development",
    "code": "DEV",
    "description": "Frontend and Backend Engineering",
    "icon": "Building2",
    "color": "text-blue-400",
    "bg": "bg-blue-500/10",
    "border": "hover:border-blue-500/40",
    "headEmployee": null,
    "designations": [
      "Frontend Dev",
      "Backend Dev"
    ],
    "isActive": true,
    "isDeleted": false,
    "_id": "6ada3b63c2a389171d9e3ccc",
    "createdAt": "2026-10-22T16:35:47.662Z",
    "updatedAt": "2026-10-22T16:35:47.662Z",
    "__v": 0
  }
}
```

### Test 10: Create Employee (WB-024)
- **Endpoint**: `POST /api/v1/admin/employees`
- **Scenario**: Create employee Rahul Sharma with baseSalary 45000
- **HTTP Status**: `201` (Expected: `201`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employeeId": "WB-024",
    "fullName": "Rahul Sharma",
    "email": "rahul.sharma@company.com",
    "phone": "",
    "department": "Development",
    "departmentRef": "6ada3b63c2a389171d9e3ccc",
    "role": "Frontend Dev",
    "designation": "Frontend Dev",
    "reportingManager": null,
    "joiningDate": "2023-01-15T00:00:00.000Z",
    "baseSalary": 45000,
    "status": "Active",
    "dailyPresenceStatus": "Absent",
    "loginAccess": "Email + temporary password",
    "attendancePolicy": "Standard office hours",
    "salaryCycle": "Monthly - calendar month",
    "permissions": [
      "self:profile:read",
      "self:profile:update",
      "self:attendance:mark",
      "self:attendance:read",
      "self:tasks:manage",
      "self:payslips:read"
    ],
    "attendanceSummary": {
      "currentMonthPresentDays": 0,
      "currentMonthHalfDays": 0,
      "currentMonthLateDays": 0,
      "currentMonthLeaveDays": 0,
      "currentMonthHoursMinutes": 0,
      "totalWorkingDaysInMonth": 26,
      "lastUpdatedAt": null
    },
    "failedLoginAttempts": 0,
    "lockUntil": null,
    "lastLoginAt": null,
    "lastLoginIp": null,
    "lastActivityAt": null,
    "passwordChangedAt": null,
    "isDeleted": false,
    "deletedAt": null,
    "_id": "6ada3b63c2a389171d9e3cce",
    "documents": [],
    "createdAt": "2026-10-22T16:35:47.678Z",
    "updatedAt": "2026-10-22T16:35:47.678Z"
  }
}
```

### Test 11: Create Employee (WB-019)
- **Endpoint**: `POST /api/v1/admin/employees`
- **Scenario**: Create second employee Priya Verma for data isolation testing
- **HTTP Status**: `201` (Expected: `201`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employeeId": "WB-019",
    "fullName": "Priya Verma",
    "email": "priya.v@company.com",
    "phone": "",
    "department": "QA",
    "departmentRef": "6ada3b64c2a389171d9e3cd0",
    "role": "QA Engineer",
    "designation": "QA Engineer",
    "reportingManager": null,
    "joiningDate": "2023-03-10T00:00:00.000Z",
    "baseSalary": 40000,
    "status": "Active",
    "dailyPresenceStatus": "Absent",
    "loginAccess": "Email + temporary password",
    "attendancePolicy": "Standard office hours",
    "salaryCycle": "Monthly - calendar month",
    "permissions": [
      "self:profile:read",
      "self:profile:update",
      "self:attendance:mark",
      "self:attendance:read",
      "self:tasks:manage",
      "self:payslips:read"
    ],
    "attendanceSummary": {
      "currentMonthPresentDays": 0,
      "currentMonthHalfDays": 0,
      "currentMonthLateDays": 0,
      "currentMonthLeaveDays": 0,
      "currentMonthHoursMinutes": 0,
      "totalWorkingDaysInMonth": 26,
      "lastUpdatedAt": null
    },
    "failedLoginAttempts": 0,
    "lockUntil": null,
    "lastLoginAt": null,
    "lastLoginIp": null,
    "lastActivityAt": null,
    "passwordChangedAt": null,
    "isDeleted": false,
    "deletedAt": null,
    "_id": "6ada3b64c2a389171d9e3cd1",
    "documents": [],
    "createdAt": "2026-10-22T16:35:48.372Z",
    "updatedAt": "2026-10-22T16:35:48.372Z"
  }
}
```

### Test 12: List Employees
- **Endpoint**: `GET /api/v1/admin/employees?page=1&limit=10&search=Rahul`
- **Scenario**: Paginated employee list with search filter
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Employees fetched successfully",
  "data": [
    {
      "attendanceSummary": {
        "currentMonthPresentDays": 0,
        "currentMonthHalfDays": 0,
        "currentMonthLateDays": 0,
        "currentMonthLeaveDays": 0,
        "currentMonthHoursMinutes": 0,
        "totalWorkingDaysInMonth": 26,
        "lastUpdatedAt": null
      },
      "_id": "6ada3b63c2a389171d9e3cce",
      "employeeId": "WB-024",
      "fullName": "Rahul Sharma",
      "email": "rahul.sharma@company.com",
      "phone": "",
      "department": "Development",
      "departmentRef": "6ada3b63c2a389171d9e3ccc",
      "role": "Frontend Dev",
      "designation": "Frontend Dev",
      "reportingManager": null,
      "joiningDate": "2023-01-15T00:00:00.000Z",
      "baseSalary": 45000,
      "status": "Active",
      "dailyPresenceStatus": "Absent",
      "loginAccess": "Email + temporary password",
      "attendancePolicy": "Standard office hours",
      "salaryCycle": "Monthly - calendar month",
      "permissions": [
        "self:profile:read",
        "self:profile:update",
        "self:attendance:mark",
        "self:attendance:read",
        "self:tasks:manage",
        "self:payslips:read"
      ],
      "failedLoginAttempts": 0,
      "lockUntil": null,
      "lastLoginAt": null,
      "lastLoginIp": null,
      "lastActivityAt": null,
      "passwordChangedAt": null,
      "isDeleted": false,
      "deletedAt": null,
      "documents": [],
      "createdAt": "2026-10-22T16:35:47.678Z",
      "updatedAt": "2026-10-22T16:35:47.678Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Test 13: Get Employee Details
- **Endpoint**: `GET /api/v1/admin/employees/WB-024`
- **Scenario**: Fetch employee profile, task stats, and monthly attendance calendar
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Employee details fetched successfully",
  "data": {
    "employee": {
      "attendanceSummary": {
        "currentMonthPresentDays": 0,
        "currentMonthHalfDays": 0,
        "currentMonthLateDays": 0,
        "currentMonthLeaveDays": 0,
        "currentMonthHoursMinutes": 0,
        "totalWorkingDaysInMonth": 26,
        "lastUpdatedAt": null
      },
      "_id": "6ada3b63c2a389171d9e3cce",
      "employeeId": "WB-024",
      "fullName": "Rahul Sharma",
      "email": "rahul.sharma@company.com",
      "phone": "",
      "department": "Development",
      "departmentRef": "6ada3b63c2a389171d9e3ccc",
      "role": "Frontend Dev",
      "designation": "Frontend Dev",
      "reportingManager": null,
      "joiningDate": "2023-01-15T00:00:00.000Z",
      "baseSalary": 45000,
      "status": "Active",
      "dailyPresenceStatus": "Absent",
      "loginAccess": "Email + temporary password",
      "attendancePolicy": "Standard office hours",
      "salaryCycle": "Monthly - calendar month",
      "permissions": [
        "self:profile:read",
        "self:profile:update",
        "self:attendance:mark",
        "self:attendance:read",
        "self:tasks:manage",
        "self:payslips:read"
      ],
      "failedLoginAttempts": 0,
      "lockUntil": null,
      "lastLoginAt": null,
      "lastLoginIp": null,
      "lastActivityAt": null,
      "passwordChangedAt": null,
      "isDeleted": false,
      "deletedAt": null,
      "documents": [],
      "createdAt": "2026-10-22T16:35:47.678Z",
      "updatedAt": "2026-10-22T16:35:47.678Z"
    },
    "taskStats": {
      "totalTasks": 0,
      "completedTasks": 0
    },
    "salaryStructure": {
      "_id": "6ada3b633bbfd4bbed8468e3",
      "employee": "6ada3b63c2a389171d9e3cce",
      "__v": 0,
      "baseSalary": 45000,
      "basicPercent": 50,
      "createdAt": "2026-10-22T16:35:47.970Z",
      "currency": "INR",
      "daPercent": 10,
      "defaultMonthlyAdjustment": 0,
      "effectiveFrom": "2026-10-22T16:35:47.973Z",
      "employeeId": "WB-024",
      "esiEnabled": false,
      "esiRatePercent": 0.75,
      "hraPercent": 25,
      "overtimeEligible": true,
      "overtimeHourlyMultiplier": 1.5,
      "pfEnabled": false,
      "pfRatePercent": 12,
      "professionalTaxAmount": 0,
      "salaryBasis": "WORKING_DAYS",
      "specialAllowancePercent": 15,
      "tdsRatePercent": 0,
      "updatedAt": "2026-10-22T16:35:47.970Z",
      "updatedBy": "6ada3b62c2a389171d9e3cc6"
    },
    "monthlyAttendance": {
      "month": 10,
      "year": 2026,
      "calendar": [
        {
          "date": 1,
          "dateString": "2026-10-01",
          "dayName": "Thu",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 2,
          "dateString": "2026-10-02",
          "dayName": "Fri",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 3,
          "dateString": "2026-10-03",
          "dayName": "Sat",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 4,
          "dateString": "2026-10-04",
          "dayName": "Sun",
          "status": "Weekly Off",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 5,
          "dateString": "2026-10-05",
          "dayName": "Mon",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 6,
          "dateString": "2026-10-06",
          "dayName": "Tue",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 7,
          "dateString": "2026-10-07",
          "dayName": "Wed",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 8,
          "dateString": "2026-10-08",
          "dayName": "Thu",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 9,
          "dateString": "2026-10-09",
          "dayName": "Fri",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 10,
          "dateString": "2026-10-10",
          "dayName": "Sat",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 11,
          "dateString": "2026-10-11",
          "dayName": "Sun",
          "status": "Weekly Off",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 12,
          "dateString": "2026-10-12",
          "dayName": "Mon",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 13,
          "dateString": "2026-10-13",
          "dayName": "Tue",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 14,
          "dateString": "2026-10-14",
          "dayName": "Wed",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 15,
          "dateString": "2026-10-15",
          "dayName": "Thu",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 16,
          "dateString": "2026-10-16",
          "dayName": "Fri",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 17,
          "dateString": "2026-10-17",
          "dayName": "Sat",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 18,
          "dateString": "2026-10-18",
          "dayName": "Sun",
          "status": "Weekly Off",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 19,
          "dateString": "2026-10-19",
          "dayName": "Mon",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 20,
          "dateString": "2026-10-20",
          "dayName": "Tue",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 21,
          "dateString": "2026-10-21",
          "dayName": "Wed",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 22,
          "dateString": "2026-10-22",
          "dayName": "Thu",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 23,
          "dateString": "2026-10-23",
          "dayName": "Fri",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 24,
          "dateString": "2026-10-24",
          "dayName": "Sat",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 25,
          "dateString": "2026-10-25",
          "dayName": "Sun",
          "status": "Weekly Off",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 26,
          "dateString": "2026-10-26",
          "dayName": "Mon",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 27,
          "dateString": "2026-10-27",
          "dayName": "Tue",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 28,
          "dateString": "2026-10-28",
          "dayName": "Wed",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 29,
          "dateString": "2026-10-29",
          "dayName": "Thu",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 30,
          "dateString": "2026-10-30",
          "dayName": "Fri",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        },
        {
          "date": 31,
          "dateString": "2026-10-31",
          "dayName": "Sat",
          "status": "Absent",
          "hours": "0h 0m",
          "approvalStatus": "None"
        }
      ]
    }
  }
}
```

### Test 14: Update Employee
- **Endpoint**: `PUT /api/v1/admin/employees/WB-024`
- **Scenario**: Update employee phone and designation
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "attendanceSummary": {
      "currentMonthPresentDays": 0,
      "currentMonthHalfDays": 0,
      "currentMonthLateDays": 0,
      "currentMonthLeaveDays": 0,
      "currentMonthHoursMinutes": 0,
      "totalWorkingDaysInMonth": 26,
      "lastUpdatedAt": null
    },
    "_id": "6ada3b63c2a389171d9e3cce",
    "employeeId": "WB-024",
    "fullName": "Rahul Sharma",
    "email": "rahul.sharma@company.com",
    "phone": "+91-9876543210",
    "department": "Development",
    "departmentRef": "6ada3b63c2a389171d9e3ccc",
    "role": "Frontend Dev",
    "designation": "Senior Frontend Developer",
    "reportingManager": null,
    "joiningDate": "2023-01-15T00:00:00.000Z",
    "baseSalary": 45000,
    "status": "Active",
    "dailyPresenceStatus": "Absent",
    "loginAccess": "Email + temporary password",
    "attendancePolicy": "Standard office hours",
    "salaryCycle": "Monthly - calendar month",
    "permissions": [
      "self:profile:read",
      "self:profile:update",
      "self:attendance:mark",
      "self:attendance:read",
      "self:tasks:manage",
      "self:payslips:read"
    ],
    "failedLoginAttempts": 0,
    "lockUntil": null,
    "lastLoginAt": null,
    "lastLoginIp": null,
    "lastActivityAt": null,
    "passwordChangedAt": null,
    "isDeleted": false,
    "deletedAt": null,
    "documents": [],
    "createdAt": "2026-10-22T16:35:47.678Z",
    "updatedAt": "2026-10-22T16:35:48.776Z"
  }
}
```

### Test 15: Employee Login (Rahul Sharma)
- **Endpoint**: `POST /api/v1/employee/auth/login`
- **Scenario**: Employee logs in; records LoginHistory in UTC & Asia/Kolkata without auto-creating approved attendance
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Employee logged in successfully",
  "data": {
    "employee": {
      "attendanceSummary": {
        "currentMonthPresentDays": 0,
        "currentMonthHalfDays": 0,
        "currentMonthLateDays": 0,
        "currentMonthLeaveDays": 0,
        "currentMonthHoursMinutes": 0,
        "totalWorkingDaysInMonth": 26,
        "lastUpdatedAt": null
      },
      "_id": "6ada3b63c2a389171d9e3cce",
      "employeeId": "WB-024",
      "fullName": "Rahul Sharma",
      "email": "rahul.sharma@company.com",
      "phone": "+91-9876543210",
      "department": "Development",
      "departmentRef": "6ada3b63c2a389171d9e3ccc",
      "role": "Frontend Dev",
      "designation": "Senior Frontend Developer",
      "reportingManager": null,
      "joiningDate": "2023-01-15T00:00:00.000Z",
      "baseSalary": 45000,
      "status": "Active",
      "dailyPresenceStatus": "Absent",
      "loginAccess": "Email + temporary password",
      "attendancePolicy": "Standard office hours",
      "salaryCycle": "Monthly - calendar month",
      "permissions": [
        "self:profile:read",
        "self:profile:update",
        "self:attendance:mark",
        "self:attendance:read",
        "self:tasks:manage",
        "self:payslips:read"
      ],
      "failedLoginAttempts": 0,
      "lockUntil": null,
      "lastLoginAt": "2026-10-22T16:35:48.780Z",
      "lastLoginIp": "127.0.0.1",
      "lastActivityAt": "2026-10-22T16:35:48.780Z",
      "passwordChangedAt": null,
      "isDeleted": false,
      "deletedAt": null,
      "documents": [],
      "createdAt": "2026-10-22T16:35:47.678Z",
      "updatedAt": "2026-10-22T16:35:49.060Z"
    },
    "accessToken": "<REDACTED_JWT_TOKEN>",
    "refreshToken": "<REDACTED_JWT_TOKEN>",
    "sessionId": "3e2ac2f2-fcdf-4a20-b814-d07279e02488",
    "expiresAt": "2026-10-29T16:35:49.189Z",
    "loginHistory": {
      "userType": "Employee",
      "userId": "6ada3b63c2a389171d9e3cce",
      "employeeId": "WB-024",
      "email": "rahul.sharma@company.com",
      "sessionId": "3e2ac2f2-fcdf-4a20-b814-d07279e02488",
      "loginDate": "2026-10-22",
      "loginTime": "10:05 PM",
      "timezone": "Asia/Kolkata",
      "loginTimestampUTC": "2026-10-22T16:35:49.189Z",
      "logoutTimestampUTC": null,
      "logoutTime": null,
      "lastActivityTimestamp": "2026-10-22T16:35:49.189Z",
      "sessionDurationMinutes": 0,
      "ipAddress": "127.0.0.1",
      "deviceInfo": {
        "browser": "Unknown Browser",
        "os": "Unknown OS",
        "deviceType": "Desktop",
        "raw": "Techneest-HTTP-TestRunner/1.0 (macOS)"
      },
      "sessionStatus": "Active",
      "failureReason": null,
      "_id": "6ada3b65c2a389171d9e3cd5",
      "createdAt": "2026-10-22T16:35:49.372Z",
      "updatedAt": "2026-10-22T16:35:49.372Z",
      "__v": 0
    }
  }
}
```

### Test 16: Employee Login (Priya Verma)
- **Endpoint**: `POST /api/v1/employee/auth/login`
- **Scenario**: Second employee logs in
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Employee logged in successfully",
  "data": {
    "employee": {
      "attendanceSummary": {
        "currentMonthPresentDays": 0,
        "currentMonthHalfDays": 0,
        "currentMonthLateDays": 0,
        "currentMonthLeaveDays": 0,
        "currentMonthHoursMinutes": 0,
        "totalWorkingDaysInMonth": 26,
        "lastUpdatedAt": null
      },
      "_id": "6ada3b64c2a389171d9e3cd1",
      "employeeId": "WB-019",
      "fullName": "Priya Verma",
      "email": "priya.v@company.com",
      "phone": "",
      "department": "QA",
      "departmentRef": "6ada3b64c2a389171d9e3cd0",
      "role": "QA Engineer",
      "designation": "QA Engineer",
      "reportingManager": null,
      "joiningDate": "2023-03-10T00:00:00.000Z",
      "baseSalary": 40000,
      "status": "Active",
      "dailyPresenceStatus": "Absent",
      "loginAccess": "Email + temporary password",
      "attendancePolicy": "Standard office hours",
      "salaryCycle": "Monthly - calendar month",
      "permissions": [
        "self:profile:read",
        "self:profile:update",
        "self:attendance:mark",
        "self:attendance:read",
        "self:tasks:manage",
        "self:payslips:read"
      ],
      "failedLoginAttempts": 0,
      "lockUntil": null,
      "lastLoginAt": "2026-10-22T16:35:49.731Z",
      "lastLoginIp": "127.0.0.1",
      "lastActivityAt": "2026-10-22T16:35:49.731Z",
      "passwordChangedAt": null,
      "isDeleted": false,
      "deletedAt": null,
      "documents": [],
      "createdAt": "2026-10-22T16:35:48.372Z",
      "updatedAt": "2026-10-22T16:35:50.014Z"
    },
    "accessToken": "<REDACTED_JWT_TOKEN>",
    "refreshToken": "<REDACTED_JWT_TOKEN>",
    "sessionId": "956632d3-7afe-44a6-883c-04c562f48630",
    "expiresAt": "2026-10-29T16:35:50.015Z",
    "loginHistory": {
      "userType": "Employee",
      "userId": "6ada3b64c2a389171d9e3cd1",
      "employeeId": "WB-019",
      "email": "priya.v@company.com",
      "sessionId": "956632d3-7afe-44a6-883c-04c562f48630",
      "loginDate": "2026-10-22",
      "loginTime": "10:05 PM",
      "timezone": "Asia/Kolkata",
      "loginTimestampUTC": "2026-10-22T16:35:50.015Z",
      "logoutTimestampUTC": null,
      "logoutTime": null,
      "lastActivityTimestamp": "2026-10-22T16:35:50.015Z",
      "sessionDurationMinutes": 0,
      "ipAddress": "127.0.0.1",
      "deviceInfo": {
        "browser": "Unknown Browser",
        "os": "Unknown OS",
        "deviceType": "Desktop",
        "raw": "Techneest-HTTP-TestRunner/1.0 (macOS)"
      },
      "sessionStatus": "Active",
      "failureReason": null,
      "_id": "6ada3b66c2a389171d9e3cd8",
      "createdAt": "2026-10-22T16:35:50.152Z",
      "updatedAt": "2026-10-22T16:35:50.152Z",
      "__v": 0
    }
  }
}
```

### Test 17: RBAC Restriction Check (Employee -> Admin API)
- **Endpoint**: `GET /api/v1/admin/employees`
- **Scenario**: Employee token attempting to access Admin route is rejected with 403
- **HTTP Status**: `403` (Expected: `403`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": false,
  "message": "Forbidden: Admin privileges required to access this resource"
}
```

### Test 18: Verify Login Does Not Count as Approved Attendance
- **Endpoint**: `GET /api/v1/admin/attendance/register?employeeId=WB-024`
- **Scenario**: Official AttendanceRegister has 0 records immediately after login before check-in & admin approval
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Official attendance register fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

### Test 19: Admin Views Employee Login History
- **Endpoint**: `GET /api/v1/admin/activity/login-history?employeeId=WB-024`
- **Scenario**: Verify login date, time, IP, and device metadata recorded
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Login history fetched successfully",
  "data": [
    {
      "deviceInfo": {
        "browser": "Unknown Browser",
        "os": "Unknown OS",
        "deviceType": "Desktop",
        "raw": "Techneest-HTTP-TestRunner/1.0 (macOS)"
      },
      "_id": "6ada3b65c2a389171d9e3cd5",
      "userType": "Employee",
      "userId": {
        "_id": "6ada3b63c2a389171d9e3cce",
        "employeeId": "WB-024",
        "fullName": "Rahul Sharma",
        "email": "rahul.sharma@company.com",
        "department": "Development",
        "role": "Frontend Dev"
      },
      "employeeId": "WB-024",
      "email": "rahul.sharma@company.com",
      "sessionId": "3e2ac2f2-fcdf-4a20-b814-d07279e02488",
      "loginDate": "2026-10-22",
      "loginTime": "10:05 PM",
      "timezone": "Asia/Kolkata",
      "loginTimestampUTC": "2026-10-22T16:35:49.189Z",
      "logoutTimestampUTC": null,
      "logoutTime": null,
      "lastActivityTimestamp": "2026-10-22T16:35:49.189Z",
      "sessionDurationMinutes": 0,
      "ipAddress": "127.0.0.1",
      "sessionStatus": "Active",
      "failureReason": null,
      "createdAt": "2026-10-22T16:35:49.372Z",
      "updatedAt": "2026-10-22T16:35:49.372Z",
      "__v": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Test 20: Admin Views Active Employee Sessions
- **Endpoint**: `GET /api/v1/admin/activity/active-sessions`
- **Scenario**: List currently active employee sessions with duration
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Active employee sessions fetched successfully",
  "data": [
    {
      "sessionId": "956632d3-7afe-44a6-883c-04c562f48630",
      "employee": {
        "_id": "6ada3b64c2a389171d9e3cd1",
        "employeeId": "WB-019",
        "fullName": "Priya Verma",
        "email": "priya.v@company.com",
        "department": "QA",
        "role": "QA Engineer"
      },
      "employeeIdCode": "WB-019",
      "ipAddress": "127.0.0.1",
      "deviceInfo": {
        "browser": "Unknown Browser",
        "os": "Unknown OS",
        "deviceType": "Desktop",
        "raw": "Techneest-HTTP-TestRunner/1.0 (macOS)"
      },
      "loginAt": "2026-10-22T16:35:50.015Z",
      "lastActivityAt": "2026-10-22T16:35:50.015Z",
      "sessionDurationMinutes": 0,
      "sessionDurationFormatted": "0h 0m",
      "status": "Active"
    },
    {
      "sessionId": "3e2ac2f2-fcdf-4a20-b814-d07279e02488",
      "employee": {
        "_id": "6ada3b63c2a389171d9e3cce",
        "employeeId": "WB-024",
        "fullName": "Rahul Sharma",
        "email": "rahul.sharma@company.com",
        "department": "Development",
        "role": "Frontend Dev"
      },
      "employeeIdCode": "WB-024",
      "ipAddress": "127.0.0.1",
      "deviceInfo": {
        "browser": "Unknown Browser",
        "os": "Unknown OS",
        "deviceType": "Desktop",
        "raw": "Techneest-HTTP-TestRunner/1.0 (macOS)"
      },
      "loginAt": "2026-10-22T16:35:49.189Z",
      "lastActivityAt": "2026-10-22T16:35:49.189Z",
      "sessionDurationMinutes": 0,
      "sessionDurationFormatted": "0h 0m",
      "status": "Active"
    }
  ]
}
```

### Test 21: Employee Self Check-In
- **Endpoint**: `POST /api/v1/employee/attendance/check-in`
- **Scenario**: Employee marks check-in; creates Pending attendance record
- **HTTP Status**: `201` (Expected: `201`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Checked in successfully. Attendance record is pending admin approval.",
  "data": {
    "employee": "6ada3b63c2a389171d9e3cce",
    "employeeId": "WB-024",
    "attendanceDate": "2026-10-22",
    "month": 10,
    "year": 2026,
    "checkInTime": "2026-10-22T16:35:50.589Z",
    "checkOutTime": null,
    "checkInDisplay": "10:05 PM",
    "checkOutDisplay": "—",
    "workingDurationMinutes": 0,
    "workingHoursDecimal": 0,
    "durationDisplay": "0h 0m",
    "isLate": true,
    "lateByMinutes": 785,
    "lateByDisplay": "785m",
    "isEarlyCheckout": false,
    "earlyCheckoutByMinutes": 0,
    "isHalfDay": false,
    "overtimeMinutes": 0,
    "attendanceStatus": "Late",
    "approvalStatus": "Pending",
    "reviewedBy": null,
    "reviewedAt": null,
    "reviewReason": null,
    "correctionRequest": {
      "isRequested": false,
      "requestedAt": null,
      "originalCheckInTime": null,
      "originalCheckOutTime": null,
      "requestedCheckInTime": null,
      "requestedCheckOutTime": null,
      "reason": null,
      "resolutionStatus": "None",
      "resolvedBy": null,
      "resolvedAt": null,
      "resolutionComment": null
    },
    "ipAddress": "127.0.0.1",
    "notes": "Started work on landing page UI",
    "_id": "6ada3b66c2a389171d9e3cdb",
    "createdAt": "2026-10-22T16:35:50.595Z",
    "updatedAt": "2026-10-22T16:35:50.595Z",
    "__v": 0
  }
}
```

### Test 22: Duplicate Attendance Check-In Prevention
- **Endpoint**: `POST /api/v1/employee/attendance/check-in`
- **Scenario**: Second check-in on the same date is rejected with 409
- **HTTP Status**: `409` (Expected: `409`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": false,
  "message": "Attendance already marked for today (2026-10-22). Duplicate check-in is not allowed."
}
```

### Test 23: Employee Self Check-Out
- **Endpoint**: `POST /api/v1/employee/attendance/check-out`
- **Scenario**: Employee checks out; duration calculated and status stays Pending approval
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Checked out successfully. Working duration recorded.",
  "data": {
    "correctionRequest": {
      "isRequested": false,
      "requestedAt": null,
      "originalCheckInTime": null,
      "originalCheckOutTime": null,
      "requestedCheckInTime": null,
      "requestedCheckOutTime": null,
      "reason": null,
      "resolutionStatus": "None",
      "resolvedBy": null,
      "resolvedAt": null,
      "resolutionComment": null
    },
    "_id": "6ada3b66c2a389171d9e3cdb",
    "employee": "6ada3b63c2a389171d9e3cce",
    "employeeId": "WB-024",
    "attendanceDate": "2026-10-22",
    "month": 10,
    "year": 2026,
    "checkInTime": "2026-10-22T16:35:50.589Z",
    "checkOutTime": "2026-10-22T16:35:50.622Z",
    "checkInDisplay": "10:05 PM",
    "checkOutDisplay": "10:05 PM",
    "workingDurationMinutes": 0,
    "workingHoursDecimal": 0,
    "durationDisplay": "0h 0m",
    "isLate": true,
    "lateByMinutes": 785,
    "lateByDisplay": "785m",
    "isEarlyCheckout": false,
    "earlyCheckoutByMinutes": 0,
    "isHalfDay": false,
    "overtimeMinutes": 0,
    "attendanceStatus": "Absent",
    "approvalStatus": "Pending",
    "reviewedBy": null,
    "reviewedAt": null,
    "reviewReason": null,
    "ipAddress": "127.0.0.1",
    "notes": "Started work on landing page UI",
    "createdAt": "2026-10-22T16:35:50.595Z",
    "updatedAt": "2026-10-22T16:35:50.626Z",
    "__v": 0
  }
}
```

### Test 24: Employee Attendance Correction Request
- **Endpoint**: `POST /api/v1/employee/attendance/6ada3b66c2a389171d9e3cdb/correction-request`
- **Scenario**: Employee submits correction request with full 9h shift timestamps
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Attendance correction request submitted for admin approval",
  "data": {
    "correctionRequest": {
      "isRequested": true,
      "requestedAt": "2026-10-22T16:35:50.638Z",
      "originalCheckInTime": "2026-10-22T16:35:50.589Z",
      "originalCheckOutTime": "2026-10-22T16:35:50.622Z",
      "requestedCheckInTime": "2026-10-22T03:30:00.000Z",
      "requestedCheckOutTime": "2026-10-22T12:30:00.000Z",
      "reason": "Forgot to check in at 9 AM sharp",
      "resolutionStatus": "Pending"
    },
    "_id": "6ada3b66c2a389171d9e3cdb",
    "employee": "6ada3b63c2a389171d9e3cce",
    "employeeId": "WB-024",
    "attendanceDate": "2026-10-22",
    "month": 10,
    "year": 2026,
    "checkInTime": "2026-10-22T16:35:50.589Z",
    "checkOutTime": "2026-10-22T16:35:50.622Z",
    "checkInDisplay": "10:05 PM",
    "checkOutDisplay": "10:05 PM",
    "workingDurationMinutes": 0,
    "workingHoursDecimal": 0,
    "durationDisplay": "0h 0m",
    "isLate": true,
    "lateByMinutes": 785,
    "lateByDisplay": "785m",
    "isEarlyCheckout": false,
    "earlyCheckoutByMinutes": 0,
    "isHalfDay": false,
    "overtimeMinutes": 0,
    "attendanceStatus": "Absent",
    "approvalStatus": "Correction Requested",
    "reviewedBy": null,
    "reviewedAt": null,
    "reviewReason": null,
    "ipAddress": "127.0.0.1",
    "notes": "Started work on landing page UI",
    "createdAt": "2026-10-22T16:35:50.595Z",
    "updatedAt": "2026-10-22T16:35:50.639Z",
    "__v": 0
  }
}
```

### Test 25: Admin Views Pending Attendance Approvals
- **Endpoint**: `GET /api/v1/admin/attendance/pending`
- **Scenario**: Admin lists pending / correction-requested attendance records
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Pending attendance records fetched successfully",
  "data": [
    {
      "correctionRequest": {
        "resolvedBy": null,
        "resolvedAt": null,
        "resolutionComment": null,
        "isRequested": true,
        "requestedAt": "2026-10-22T16:35:50.638Z",
        "originalCheckInTime": "2026-10-22T16:35:50.589Z",
        "originalCheckOutTime": "2026-10-22T16:35:50.622Z",
        "requestedCheckInTime": "2026-10-22T03:30:00.000Z",
        "requestedCheckOutTime": "2026-10-22T12:30:00.000Z",
        "reason": "Forgot to check in at 9 AM sharp",
        "resolutionStatus": "Pending"
      },
      "_id": "6ada3b66c2a389171d9e3cdb",
      "employee": {
        "_id": "6ada3b63c2a389171d9e3cce",
        "employeeId": "WB-024",
        "fullName": "Rahul Sharma",
        "email": "rahul.sharma@company.com",
        "department": "Development",
        "role": "Frontend Dev"
      },
      "employeeId": "WB-024",
      "attendanceDate": "2026-10-22",
      "month": 10,
      "year": 2026,
      "checkInTime": "2026-10-22T16:35:50.589Z",
      "checkOutTime": "2026-10-22T16:35:50.622Z",
      "checkInDisplay": "10:05 PM",
      "checkOutDisplay": "10:05 PM",
      "workingDurationMinutes": 0,
      "workingHoursDecimal": 0,
      "durationDisplay": "0h 0m",
      "isLate": true,
      "lateByMinutes": 785,
      "lateByDisplay": "785m",
      "isEarlyCheckout": false,
      "earlyCheckoutByMinutes": 0,
      "isHalfDay": false,
      "overtimeMinutes": 0,
      "attendanceStatus": "Absent",
      "approvalStatus": "Correction Requested",
      "reviewedBy": null,
      "reviewedAt": null,
      "reviewReason": null,
      "ipAddress": "127.0.0.1",
      "notes": "Started work on landing page UI",
      "createdAt": "2026-10-22T16:35:50.595Z",
      "updatedAt": "2026-10-22T16:35:50.639Z",
      "__v": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Test 26: Admin Approves Attendance Entry
- **Endpoint**: `PATCH /api/v1/admin/attendance/6ada3b66c2a389171d9e3cdb/review`
- **Scenario**: Admin approves attendance; transfers to official AttendanceRegister and updates employee summary
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Attendance record approved successfully",
  "data": {
    "attendance": {
      "correctionRequest": {
        "resolvedBy": "6ada3b62c2a389171d9e3cc6",
        "resolvedAt": "2026-10-22T16:35:50.660Z",
        "resolutionComment": "Verified shift timings with team lead",
        "isRequested": true,
        "requestedAt": "2026-10-22T16:35:50.638Z",
        "originalCheckInTime": "2026-10-22T16:35:50.589Z",
        "originalCheckOutTime": "2026-10-22T16:35:50.622Z",
        "requestedCheckInTime": "2026-10-22T03:30:00.000Z",
        "requestedCheckOutTime": "2026-10-22T12:30:00.000Z",
        "reason": "Forgot to check in at 9 AM sharp",
        "resolutionStatus": "Approved"
      },
      "_id": "6ada3b66c2a389171d9e3cdb",
      "employee": "6ada3b63c2a389171d9e3cce",
      "employeeId": "WB-024",
      "attendanceDate": "2026-10-22",
      "month": 10,
      "year": 2026,
      "checkInTime": "2026-10-22T03:30:00.000Z",
      "checkOutTime": "2026-10-22T12:30:00.000Z",
      "checkInDisplay": "09:00 AM",
      "checkOutDisplay": "06:00 PM",
      "workingDurationMinutes": 540,
      "workingHoursDecimal": 9,
      "durationDisplay": "9h 00m",
      "isLate": false,
      "lateByMinutes": 0,
      "lateByDisplay": null,
      "isEarlyCheckout": false,
      "earlyCheckoutByMinutes": 0,
      "isHalfDay": false,
      "overtimeMinutes": 60,
      "attendanceStatus": "Present",
      "approvalStatus": "Approved",
      "reviewedBy": "6ada3b62c2a389171d9e3cc6",
      "reviewedAt": "2026-10-22T16:35:50.660Z",
      "reviewReason": "Verified shift timings with team lead",
      "ipAddress": "127.0.0.1",
      "notes": "Started work on landing page UI",
      "createdAt": "2026-10-22T16:35:50.595Z",
      "updatedAt": "2026-10-22T16:35:50.662Z",
      "__v": 0
    },
    "registerRecord": {
      "_id": "6ada3b663bbfd4bbed8468e5",
      "attendanceDate": "2026-10-22",
      "employee": "6ada3b63c2a389171d9e3cce",
      "__v": 0,
      "approvedAt": "2026-10-22T16:35:50.660Z",
      "approvedBy": "6ada3b62c2a389171d9e3cc6",
      "attendanceRecord": "6ada3b66c2a389171d9e3cdb",
      "checkInTime": "2026-10-22T03:30:00.000Z",
      "checkOutTime": "2026-10-22T12:30:00.000Z",
      "createdAt": "2026-10-22T16:35:50.664Z",
      "employeeId": "WB-024",
      "isManualAdjustment": false,
      "lateByMinutes": 0,
      "month": 10,
      "officialStatus": "Present",
      "overtimeMinutes": 60,
      "payableDayValue": 1,
      "remarks": "Verified shift timings with team lead",
      "updatedAt": "2026-10-22T16:35:50.664Z",
      "workingDurationMinutes": 540,
      "year": 2026
    },
    "updatedSummary": {
      "presentDays": 1,
      "halfDays": 0,
      "lateDays": 0,
      "leaveDays": 0,
      "totalMinutes": 540,
      "totalWorkingDaysInMonth": 27
    }
  }
}
```

### Test 27: Verify Official AttendanceRegister Entry
- **Endpoint**: `GET /api/v1/admin/attendance/register?employeeId=WB-024`
- **Scenario**: Verify approved attendance is now in official AttendanceRegister without duplicates
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Official attendance register fetched successfully",
  "data": [
    {
      "_id": "6ada3b663bbfd4bbed8468e5",
      "attendanceDate": "2026-10-22",
      "employee": {
        "_id": "6ada3b63c2a389171d9e3cce",
        "employeeId": "WB-024",
        "fullName": "Rahul Sharma",
        "email": "rahul.sharma@company.com",
        "department": "Development",
        "role": "Frontend Dev"
      },
      "__v": 0,
      "approvedAt": "2026-10-22T16:35:50.660Z",
      "approvedBy": {
        "_id": "6ada3b62c2a389171d9e3cc6",
        "fullName": "Vikram Admin",
        "email": "admin@workboard.com"
      },
      "attendanceRecord": "6ada3b66c2a389171d9e3cdb",
      "checkInTime": "2026-10-22T03:30:00.000Z",
      "checkOutTime": "2026-10-22T12:30:00.000Z",
      "createdAt": "2026-10-22T16:35:50.664Z",
      "employeeId": "WB-024",
      "isManualAdjustment": false,
      "lateByMinutes": 0,
      "month": 10,
      "officialStatus": "Present",
      "overtimeMinutes": 60,
      "payableDayValue": 1,
      "remarks": "Verified shift timings with team lead",
      "updatedAt": "2026-10-22T16:35:50.664Z",
      "workingDurationMinutes": 540,
      "year": 2026
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Test 28: Get Attendance Approval Audit Trail
- **Endpoint**: `GET /api/v1/admin/attendance/audit-logs?employeeId=WB-024`
- **Scenario**: Verify permanent audit trail of CHECK_IN, CHECK_OUT, CORRECTION_REQUESTED, and CORRECTION_APPROVED
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Attendance approval audit trail fetched successfully",
  "data": [
    {
      "_id": "6ada3b66c2a389171d9e3cdf",
      "attendanceRecord": "6ada3b66c2a389171d9e3cdb",
      "registerRecord": "6ada3b663bbfd4bbed8468e5",
      "employee": {
        "_id": "6ada3b63c2a389171d9e3cce",
        "employeeId": "WB-024",
        "fullName": "Rahul Sharma",
        "email": "rahul.sharma@company.com",
        "department": "Development"
      },
      "employeeId": "WB-024",
      "attendanceDate": "2026-10-22",
      "action": "CORRECTION_APPROVED",
      "performedByType": "Admin",
      "performedBy": "6ada3b62c2a389171d9e3cc6",
      "previousState": {
        "approvalStatus": "Correction Requested",
        "attendanceStatus": "Absent",
        "checkInTime": "2026-10-22T16:35:50.589Z",
        "checkOutTime": "2026-10-22T16:35:50.622Z"
      },
      "newState": {
        "approvalStatus": "Approved",
        "officialStatus": "Present",
        "payableDayValue": 1,
        "workingDurationMinutes": 540
      },
      "reason": "Verified shift timings with team lead",
      "ipAddress": "127.0.0.1",
      "createdAt": "2026-10-22T16:35:50.668Z",
      "updatedAt": "2026-10-22T16:35:50.668Z",
      "__v": 0
    },
    {
      "_id": "6ada3b66c2a389171d9e3cde",
      "attendanceRecord": "6ada3b66c2a389171d9e3cdb",
      "registerRecord": null,
      "employee": {
        "_id": "6ada3b63c2a389171d9e3cce",
        "employeeId": "WB-024",
        "fullName": "Rahul Sharma",
        "email": "rahul.sharma@company.com",
        "department": "Development"
      },
      "employeeId": "WB-024",
      "attendanceDate": "2026-10-22",
      "action": "CORRECTION_REQUESTED",
      "performedByType": "Employee",
      "performedBy": "6ada3b63c2a389171d9e3cce",
      "previousState": {
        "approvalStatus": "Pending",
        "checkInTime": "2026-10-22T16:35:50.589Z",
        "checkOutTime": "2026-10-22T16:35:50.622Z"
      },
      "newState": {
        "isRequested": true,
        "requestedAt": "2026-10-22T16:35:50.638Z",
        "originalCheckInTime": "2026-10-22T16:35:50.589Z",
        "originalCheckOutTime": "2026-10-22T16:35:50.622Z",
        "requestedCheckInTime": "2026-10-22T03:30:00.000Z",
        "requestedCheckOutTime": "2026-10-22T12:30:00.000Z",
        "reason": "Forgot to check in at 9 AM sharp",
        "resolutionStatus": "Pending"
      },
      "reason": "Forgot to check in at 9 AM sharp",
      "ipAddress": "127.0.0.1",
      "createdAt": "2026-10-22T16:35:50.640Z",
      "updatedAt": "2026-10-22T16:35:50.640Z",
      "__v": 0
    },
    {
      "_id": "6ada3b66c2a389171d9e3cdd",
      "attendanceRecord": "6ada3b66c2a389171d9e3cdb",
      "registerRecord": null,
      "employee": {
        "_id": "6ada3b63c2a389171d9e3cce",
        "employeeId": "WB-024",
        "fullName": "Rahul Sharma",
        "email": "rahul.sharma@company.com",
        "department": "Development"
      },
      "employeeId": "WB-024",
      "attendanceDate": "2026-10-22",
      "action": "CHECK_OUT",
      "performedByType": "Employee",
      "performedBy": "6ada3b63c2a389171d9e3cce",
      "previousState": {
        "checkOutTime": null,
        "workingDurationMinutes": 0,
        "attendanceStatus": "Late"
      },
      "newState": {
        "checkOutTime": "2026-10-22T16:35:50.622Z",
        "workingDurationMinutes": 0,
        "attendanceStatus": "Absent",
        "approvalStatus": "Pending"
      },
      "reason": "Employee self check-out",
      "ipAddress": "127.0.0.1",
      "createdAt": "2026-10-22T16:35:50.628Z",
      "updatedAt": "2026-10-22T16:35:50.628Z",
      "__v": 0
    },
    {
      "_id": "6ada3b66c2a389171d9e3cdc",
      "attendanceRecord": "6ada3b66c2a389171d9e3cdb",
      "registerRecord": null,
      "employee": {
        "_id": "6ada3b63c2a389171d9e3cce",
        "employeeId": "WB-024",
        "fullName": "Rahul Sharma",
        "email": "rahul.sharma@company.com",
        "department": "Development"
      },
      "employeeId": "WB-024",
      "attendanceDate": "2026-10-22",
      "action": "CHECK_IN",
      "performedByType": "Employee",
      "performedBy": "6ada3b63c2a389171d9e3cce",
      "previousState": null,
      "newState": {
        "checkInTime": "2026-10-22T16:35:50.589Z",
        "attendanceStatus": "Late",
        "approvalStatus": "Pending"
      },
      "reason": "Employee self check-in",
      "ipAddress": "127.0.0.1",
      "createdAt": "2026-10-22T16:35:50.600Z",
      "updatedAt": "2026-10-22T16:35:50.600Z",
      "__v": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4,
    "totalPages": 1
  }
}
```

### Test 29: Admin Manual Attendance Adjustment
- **Endpoint**: `POST /api/v1/admin/attendance/manual-adjustment`
- **Scenario**: Set totalWorkingDays=24 and adjust WB-024 presentDays=22 for October 2026
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Attendance manual adjustments saved successfully",
  "data": {
    "month": 10,
    "year": 2026,
    "totalWorkingDays": 24,
    "updatedEmployees": [
      {
        "employeeId": "WB-024",
        "fullName": "Rahul Sharma",
        "presentDays": 22,
        "totalWorkingDays": 24
      }
    ]
  }
}
```

### Test 30: Employee Applies for Paid Leave
- **Endpoint**: `POST /api/v1/employee/leaves`
- **Scenario**: Employee WB-024 applies for 2 days Casual Leave
- **HTTP Status**: `201` (Expected: `201`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Leave application submitted successfully",
  "data": {
    "employee": "6ada3b63c2a389171d9e3cce",
    "employeeId": "WB-024",
    "leaveType": "Casual Leave",
    "isPaid": true,
    "startDate": "2026-10-26",
    "endDate": "2026-10-27",
    "totalDays": 2,
    "isHalfDay": false,
    "reason": "Family function",
    "status": "Pending",
    "reviewedBy": null,
    "reviewedAt": null,
    "reviewComment": "",
    "_id": "6ada3b66c2a389171d9e3cf6",
    "createdAt": "2026-10-22T16:35:50.972Z",
    "updatedAt": "2026-10-22T16:35:50.972Z",
    "__v": 0
  }
}
```

### Test 31: Admin Approves Leave Request
- **Endpoint**: `PATCH /api/v1/admin/leaves/6ada3b66c2a389171d9e3cf6/review`
- **Scenario**: Admin approves 2 paid leave days for WB-024
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Leave request approved successfully",
  "data": {
    "_id": "6ada3b66c2a389171d9e3cf6",
    "employee": "6ada3b63c2a389171d9e3cce",
    "employeeId": "WB-024",
    "leaveType": "Casual Leave",
    "isPaid": true,
    "startDate": "2026-10-26",
    "endDate": "2026-10-27",
    "totalDays": 2,
    "isHalfDay": false,
    "reason": "Family function",
    "status": "Approved",
    "reviewedBy": "6ada3b62c2a389171d9e3cc6",
    "reviewedAt": "2026-10-22T16:35:50.980Z",
    "reviewComment": "Approved paid casual leave",
    "createdAt": "2026-10-22T16:35:50.972Z",
    "updatedAt": "2026-10-22T16:35:50.980Z",
    "__v": 0
  }
}
```

### Test 32: Run Monthly Payroll Calculation (Oct 2026)
- **Endpoint**: `POST /api/v1/admin/payroll/run`
- **Scenario**: Calculate draft payroll for October 2026 using approved attendance and leaves
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Payroll calculated successfully for October 2026",
  "data": {
    "payPeriodLabel": "October 2026",
    "month": 10,
    "year": 2026,
    "processedCount": 1,
    "skippedFinalized": [],
    "payrolls": [
      {
        "attendanceBreakdown": {
          "totalCalendarDays": 31,
          "totalWorkingDays": 24,
          "approvedPresentDays": 22,
          "approvedHalfDays": 0,
          "paidLeaveDays": 2,
          "unpaidLeaveDays": 0,
          "paidHolidays": 0,
          "unpaidAbsences": 0,
          "payableDays": 24,
          "overtimeHours": 1
        },
        "earnings": {
          "basicEarned": 22500,
          "hraEarned": 11250,
          "daEarned": 4500,
          "specialAllowanceEarned": 6750,
          "overtimePay": 351.56,
          "bonus": 0,
          "incentives": 0,
          "positiveAdjustments": 0,
          "grossEarned": 45351.56
        },
        "deductions": {
          "unpaidLeaveDeduction": 0,
          "pf": 0,
          "esi": 0,
          "professionalTax": 0,
          "tds": 0,
          "otherDeductions": 0,
          "totalDeductions": 0
        },
        "_id": "6ada3b673bbfd4bbed8468e7",
        "employee": "6ada3b63c2a389171d9e3cce",
        "month": 10,
        "year": 2026,
        "__v": 0,
        "adjustmentsList": [],
        "approvedAt": null,
        "approvedBy": null,
        "baseSalary": 45000,
        "createdAt": "2026-10-22T16:35:51.658Z",
        "currency": "INR",
        "employeeId": "WB-024",
        "finalizedAt": null,
        "finalizedBy": null,
        "immutableSnapshot": null,
        "isImmutable": false,
        "netAdjustment": 351.56,
        "netPayable": 45352,
        "paidAt": null,
        "payPeriodLabel": "October 2026",
        "paymentMethod": null,
        "paymentReference": null,
        "paymentStatus": "Pending",
        "reversalReason": null,
        "updatedAt": "2026-10-22T16:35:51.658Z",
        "workflowStatus": "Draft"
      }
    ]
  }
}
```

### Test 33: Add Payroll Bonus Adjustment
- **Endpoint**: `POST /api/v1/admin/payroll/6ada3b673bbfd4bbed8468e7/adjustments`
- **Scenario**: Add INR 2,000 Festival Bonus and recalculate before finalization
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Payroll adjustment applied and recalculated successfully",
  "data": {
    "attendanceBreakdown": {
      "totalCalendarDays": 31,
      "totalWorkingDays": 24,
      "approvedPresentDays": 22,
      "approvedHalfDays": 0,
      "paidLeaveDays": 2,
      "unpaidLeaveDays": 0,
      "paidHolidays": 0,
      "unpaidAbsences": 0,
      "payableDays": 24,
      "overtimeHours": 1
    },
    "earnings": {
      "basicEarned": 22500,
      "hraEarned": 11250,
      "daEarned": 4500,
      "specialAllowanceEarned": 6750,
      "overtimePay": 351.56,
      "bonus": 2000,
      "incentives": 0,
      "positiveAdjustments": 0,
      "grossEarned": 47351.56
    },
    "deductions": {
      "unpaidLeaveDeduction": 0,
      "pf": 0,
      "esi": 0,
      "professionalTax": 0,
      "tds": 0,
      "otherDeductions": 0,
      "totalDeductions": 0
    },
    "_id": "6ada3b673bbfd4bbed8468e7",
    "employee": "6ada3b63c2a389171d9e3cce",
    "month": 10,
    "year": 2026,
    "__v": 1,
    "adjustmentsList": [
      {
        "type": "Bonus",
        "label": "Diwali Performance Bonus",
        "amount": 2000,
        "reason": "Festive bonus",
        "addedBy": "6ada3b62c2a389171d9e3cc6",
        "addedAt": "2026-10-22T16:35:51.682Z",
        "_id": "6ada3b67c2a389171d9e3cf9"
      }
    ],
    "approvedAt": null,
    "approvedBy": null,
    "baseSalary": 45000,
    "createdAt": "2026-10-22T16:35:51.658Z",
    "currency": "INR",
    "employeeId": "WB-024",
    "finalizedAt": null,
    "finalizedBy": null,
    "immutableSnapshot": null,
    "isImmutable": false,
    "netAdjustment": 2351.56,
    "netPayable": 47352,
    "paidAt": null,
    "payPeriodLabel": "October 2026",
    "paymentMethod": null,
    "paymentReference": null,
    "paymentStatus": "Pending",
    "reversalReason": null,
    "updatedAt": "2026-10-22T16:35:51.685Z",
    "workflowStatus": "Draft"
  }
}
```

### Test 34: Approve Payroll Record
- **Endpoint**: `PATCH /api/v1/admin/payroll/6ada3b673bbfd4bbed8468e7/approve`
- **Scenario**: Admin approves payroll; workflowStatus becomes Approved while paymentStatus stays Pending
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Payroll approved successfully. Payment status remains Pending until disbursement is recorded.",
  "data": {
    "attendanceBreakdown": {
      "totalCalendarDays": 31,
      "totalWorkingDays": 24,
      "approvedPresentDays": 22,
      "approvedHalfDays": 0,
      "paidLeaveDays": 2,
      "unpaidLeaveDays": 0,
      "paidHolidays": 0,
      "unpaidAbsences": 0,
      "payableDays": 24,
      "overtimeHours": 1
    },
    "earnings": {
      "basicEarned": 22500,
      "hraEarned": 11250,
      "daEarned": 4500,
      "specialAllowanceEarned": 6750,
      "overtimePay": 351.56,
      "bonus": 2000,
      "incentives": 0,
      "positiveAdjustments": 0,
      "grossEarned": 47351.56
    },
    "deductions": {
      "unpaidLeaveDeduction": 0,
      "pf": 0,
      "esi": 0,
      "professionalTax": 0,
      "tds": 0,
      "otherDeductions": 0,
      "totalDeductions": 0
    },
    "_id": "6ada3b673bbfd4bbed8468e7",
    "employee": "6ada3b63c2a389171d9e3cce",
    "month": 10,
    "year": 2026,
    "__v": 1,
    "adjustmentsList": [
      {
        "type": "Bonus",
        "label": "Diwali Performance Bonus",
        "amount": 2000,
        "reason": "Festive bonus",
        "addedBy": "6ada3b62c2a389171d9e3cc6",
        "addedAt": "2026-10-22T16:35:51.682Z",
        "_id": "6ada3b67c2a389171d9e3cf9"
      }
    ],
    "approvedAt": "2026-10-22T16:35:51.697Z",
    "approvedBy": "6ada3b62c2a389171d9e3cc6",
    "baseSalary": 45000,
    "createdAt": "2026-10-22T16:35:51.658Z",
    "currency": "INR",
    "employeeId": "WB-024",
    "finalizedAt": null,
    "finalizedBy": null,
    "immutableSnapshot": null,
    "isImmutable": false,
    "netAdjustment": 2351.56,
    "netPayable": 47352,
    "paidAt": null,
    "payPeriodLabel": "October 2026",
    "paymentMethod": null,
    "paymentReference": null,
    "paymentStatus": "Pending",
    "reversalReason": null,
    "updatedAt": "2026-10-22T16:35:51.698Z",
    "workflowStatus": "Approved"
  }
}
```

### Test 35: Finalize Payroll & Generate Payslip
- **Endpoint**: `PATCH /api/v1/admin/payroll/6ada3b673bbfd4bbed8468e7/finalize`
- **Scenario**: Finalize payroll, lock immutable snapshot, generate PDF payslip, and log SMTP state
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Payroll finalized and official PDF salary slip generated",
  "data": {
    "payroll": {
      "attendanceBreakdown": {
        "totalCalendarDays": 31,
        "totalWorkingDays": 24,
        "approvedPresentDays": 22,
        "approvedHalfDays": 0,
        "paidLeaveDays": 2,
        "unpaidLeaveDays": 0,
        "paidHolidays": 0,
        "unpaidAbsences": 0,
        "payableDays": 24,
        "overtimeHours": 1
      },
      "earnings": {
        "basicEarned": 22500,
        "hraEarned": 11250,
        "daEarned": 4500,
        "specialAllowanceEarned": 6750,
        "overtimePay": 351.56,
        "bonus": 2000,
        "incentives": 0,
        "positiveAdjustments": 0,
        "grossEarned": 47351.56
      },
      "deductions": {
        "unpaidLeaveDeduction": 0,
        "pf": 0,
        "esi": 0,
        "professionalTax": 0,
        "tds": 0,
        "otherDeductions": 0,
        "totalDeductions": 0
      },
      "_id": "6ada3b673bbfd4bbed8468e7",
      "employee": "6ada3b63c2a389171d9e3cce",
      "month": 10,
      "year": 2026,
      "__v": 1,
      "adjustmentsList": [
        {
          "type": "Bonus",
          "label": "Diwali Performance Bonus",
          "amount": 2000,
          "reason": "Festive bonus",
          "addedBy": "6ada3b62c2a389171d9e3cc6",
          "addedAt": "2026-10-22T16:35:51.682Z",
          "_id": "6ada3b67c2a389171d9e3cf9"
        }
      ],
      "approvedAt": "2026-10-22T16:35:51.697Z",
      "approvedBy": "6ada3b62c2a389171d9e3cc6",
      "baseSalary": 45000,
      "createdAt": "2026-10-22T16:35:51.658Z",
      "currency": "INR",
      "employeeId": "WB-024",
      "finalizedAt": "2026-10-22T16:35:51.709Z",
      "finalizedBy": "6ada3b62c2a389171d9e3cc6",
      "immutableSnapshot": {
        "employeeId": "WB-024",
        "fullName": "Rahul Sharma",
        "department": "Development",
        "role": "Frontend Dev",
        "payPeriodLabel": "October 2026",
        "attendanceBreakdown": {
          "totalCalendarDays": 31,
          "totalWorkingDays": 24,
          "approvedPresentDays": 22,
          "approvedHalfDays": 0,
          "paidLeaveDays": 2,
          "unpaidLeaveDays": 0,
          "paidHolidays": 0,
          "unpaidAbsences": 0,
          "payableDays": 24,
          "overtimeHours": 1
        },
        "baseSalary": 45000,
        "earnings": {
          "basicEarned": 22500,
          "hraEarned": 11250,
          "daEarned": 4500,
          "specialAllowanceEarned": 6750,
          "overtimePay": 351.56,
          "bonus": 2000,
          "incentives": 0,
          "positiveAdjustments": 0,
          "grossEarned": 47351.56
        },
        "deductions": {
          "unpaidLeaveDeduction": 0,
          "pf": 0,
          "esi": 0,
          "professionalTax": 0,
          "tds": 0,
          "otherDeductions": 0,
          "totalDeductions": 0
        },
        "netAdjustment": 2351.56,
        "netPayable": 47352,
        "finalizedAt": "2026-10-22T16:35:51.709Z"
      },
      "isImmutable": true,
      "netAdjustment": 2351.56,
      "netPayable": 47352,
      "paidAt": null,
      "payPeriodLabel": "October 2026",
      "paymentMethod": null,
      "paymentReference": null,
      "paymentStatus": "Pending",
      "reversalReason": null,
      "updatedAt": "2026-10-22T16:35:51.709Z",
      "workflowStatus": "Finalized"
    },
    "payslip": {
      "employeeSnapshot": {
        "fullName": "Rahul Sharma",
        "employeeId": "WB-024",
        "email": "rahul.sharma@company.com",
        "department": "Development",
        "designation": "Senior Frontend Developer",
        "joiningDate": "2023-01-15"
      },
      "salarySnapshot": {
        "attendanceSummary": {
          "totalCalendarDays": 31,
          "totalWorkingDays": 24,
          "approvedPresentDays": 22,
          "approvedHalfDays": 0,
          "paidLeaveDays": 2,
          "unpaidLeaveDays": 0,
          "paidHolidays": 0,
          "unpaidAbsences": 0,
          "payableDays": 24,
          "overtimeHours": 1
        },
        "earnings": {
          "basicEarned": 22500,
          "hraEarned": 11250,
          "daEarned": 4500,
          "specialAllowanceEarned": 6750,
          "overtimePay": 351.56,
          "bonus": 2000,
          "incentives": 0,
          "positiveAdjustments": 0,
          "grossEarned": 47351.56
        },
        "deductions": {
          "unpaidLeaveDeduction": 0,
          "pf": 0,
          "esi": 0,
          "professionalTax": 0,
          "tds": 0,
          "otherDeductions": 0,
          "totalDeductions": 0
        },
        "netPayable": 47352,
        "currency": "INR"
      },
      "_id": "6ada3b673bbfd4bbed8468e8",
      "payroll": "6ada3b673bbfd4bbed8468e7",
      "__v": 0,
      "companyName": "TechNeest",
      "createdAt": "2026-10-22T16:35:51.722Z",
      "emailDeliveryStatus": "Pending",
      "emailRetryCount": 1,
      "employee": "6ada3b63c2a389171d9e3cce",
      "employeeId": "WB-024",
      "fileName": "PS-202610-WB-024.pdf",
      "generatedAt": "2026-10-22T16:35:51.709Z",
      "generatedBy": "6ada3b62c2a389171d9e3cc6",
      "lastEmailAttemptAt": "2026-10-22T16:35:51.730Z",
      "month": 10,
      "payslipNumber": "PS-202610-WB-024",
      "updatedAt": "2026-10-22T16:35:51.730Z",
      "year": 2026
    },
    "emailDelivery": {
      "sent": false,
      "status": "Pending",
      "warning": "SMTP credentials are not configured in environment variables. Email preserved in Pending state.",
      "emailLogId": "6ada3b67c2a389171d9e3cfe"
    }
  }
}
```

### Test 36: Prevent Modification of Finalized Payroll
- **Endpoint**: `POST /api/v1/admin/payroll/6ada3b673bbfd4bbed8468e7/adjustments`
- **Scenario**: Adding adjustment to Finalized immutable payroll is blocked with 400
- **HTTP Status**: `400` (Expected: `400`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": false,
  "message": "Cannot modify a Finalized payroll directly. Use the reversal workflow to make post-finalization adjustments."
}
```

### Test 37: Update Payroll Payment Status to Paid
- **Endpoint**: `PATCH /api/v1/admin/payroll/6ada3b673bbfd4bbed8468e7/payment-status`
- **Scenario**: Mark finalized payroll as Paid with bank reference number
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Payroll payment status updated to Paid",
  "data": {
    "attendanceBreakdown": {
      "totalCalendarDays": 31,
      "totalWorkingDays": 24,
      "approvedPresentDays": 22,
      "approvedHalfDays": 0,
      "paidLeaveDays": 2,
      "unpaidLeaveDays": 0,
      "paidHolidays": 0,
      "unpaidAbsences": 0,
      "payableDays": 24,
      "overtimeHours": 1
    },
    "earnings": {
      "basicEarned": 22500,
      "hraEarned": 11250,
      "daEarned": 4500,
      "specialAllowanceEarned": 6750,
      "overtimePay": 351.56,
      "bonus": 2000,
      "incentives": 0,
      "positiveAdjustments": 0,
      "grossEarned": 47351.56
    },
    "deductions": {
      "unpaidLeaveDeduction": 0,
      "pf": 0,
      "esi": 0,
      "professionalTax": 0,
      "tds": 0,
      "otherDeductions": 0,
      "totalDeductions": 0
    },
    "_id": "6ada3b673bbfd4bbed8468e7",
    "employee": "6ada3b63c2a389171d9e3cce",
    "month": 10,
    "year": 2026,
    "__v": 1,
    "adjustmentsList": [
      {
        "type": "Bonus",
        "label": "Diwali Performance Bonus",
        "amount": 2000,
        "reason": "Festive bonus",
        "addedBy": "6ada3b62c2a389171d9e3cc6",
        "addedAt": "2026-10-22T16:35:51.682Z",
        "_id": "6ada3b67c2a389171d9e3cf9"
      }
    ],
    "approvedAt": "2026-10-22T16:35:51.697Z",
    "approvedBy": "6ada3b62c2a389171d9e3cc6",
    "baseSalary": 45000,
    "createdAt": "2026-10-22T16:35:51.658Z",
    "currency": "INR",
    "employeeId": "WB-024",
    "finalizedAt": "2026-10-22T16:35:51.709Z",
    "finalizedBy": "6ada3b62c2a389171d9e3cc6",
    "immutableSnapshot": {
      "employeeId": "WB-024",
      "fullName": "Rahul Sharma",
      "department": "Development",
      "role": "Frontend Dev",
      "payPeriodLabel": "October 2026",
      "attendanceBreakdown": {
        "totalCalendarDays": 31,
        "totalWorkingDays": 24,
        "approvedPresentDays": 22,
        "approvedHalfDays": 0,
        "paidLeaveDays": 2,
        "unpaidLeaveDays": 0,
        "paidHolidays": 0,
        "unpaidAbsences": 0,
        "payableDays": 24,
        "overtimeHours": 1
      },
      "baseSalary": 45000,
      "earnings": {
        "basicEarned": 22500,
        "hraEarned": 11250,
        "daEarned": 4500,
        "specialAllowanceEarned": 6750,
        "overtimePay": 351.56,
        "bonus": 2000,
        "incentives": 0,
        "positiveAdjustments": 0,
        "grossEarned": 47351.56
      },
      "deductions": {
        "unpaidLeaveDeduction": 0,
        "pf": 0,
        "esi": 0,
        "professionalTax": 0,
        "tds": 0,
        "otherDeductions": 0,
        "totalDeductions": 0
      },
      "netAdjustment": 2351.56,
      "netPayable": 47352,
      "finalizedAt": "2026-10-22T16:35:51.709Z"
    },
    "isImmutable": true,
    "netAdjustment": 2351.56,
    "netPayable": 47352,
    "paidAt": "2026-10-22T16:35:51.748Z",
    "payPeriodLabel": "October 2026",
    "paymentMethod": "NEFT/RTGS",
    "paymentReference": "HDFC20261022998877",
    "paymentStatus": "Paid",
    "reversalReason": null,
    "updatedAt": "2026-10-22T16:35:51.749Z",
    "workflowStatus": "Finalized"
  }
}
```

### Test 38: Employee Downloads Own Payslip PDF
- **Endpoint**: `GET /api/v1/employee/payslips/6ada3b673bbfd4bbed8468e8/download`
- **Scenario**: Employee WB-024 downloads their own generated PDF salary slip
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "_binaryPdf": true,
  "byteLength": 3414,
  "headerPrefix": "%PDF-1.4"
}
```

### Test 39: Employee Data Isolation (Cross-Employee Payslip Blocked)
- **Endpoint**: `GET /api/v1/employee/payslips/6ada3b673bbfd4bbed8468e8/download`
- **Scenario**: Employee WB-019 attempting to download WB-024's payslip is rejected with 403
- **HTTP Status**: `403` (Expected: `403`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": false,
  "message": "Forbidden: You are not authorized to download another employee's salary slip"
}
```

### Test 40: Admin Resends Payslip Email
- **Endpoint**: `POST /api/v1/admin/payroll/payslips/6ada3b673bbfd4bbed8468e8/resend-email`
- **Scenario**: Admin triggers payslip resend; preserves Pending state with warning when SMTP unconfigured
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "SMTP credentials are not configured in environment variables. Email preserved in Pending state.",
  "data": {
    "payslip": {
      "employeeSnapshot": {
        "fullName": "Rahul Sharma",
        "employeeId": "WB-024",
        "email": "rahul.sharma@company.com",
        "department": "Development",
        "designation": "Senior Frontend Developer",
        "joiningDate": "2023-01-15"
      },
      "salarySnapshot": {
        "attendanceSummary": {
          "totalCalendarDays": 31,
          "totalWorkingDays": 24,
          "approvedPresentDays": 22,
          "approvedHalfDays": 0,
          "paidLeaveDays": 2,
          "unpaidLeaveDays": 0,
          "paidHolidays": 0,
          "unpaidAbsences": 0,
          "payableDays": 24,
          "overtimeHours": 1
        },
        "earnings": {
          "basicEarned": 22500,
          "hraEarned": 11250,
          "daEarned": 4500,
          "specialAllowanceEarned": 6750,
          "overtimePay": 351.56,
          "bonus": 2000,
          "incentives": 0,
          "positiveAdjustments": 0,
          "grossEarned": 47351.56
        },
        "deductions": {
          "unpaidLeaveDeduction": 0,
          "pf": 0,
          "esi": 0,
          "professionalTax": 0,
          "tds": 0,
          "otherDeductions": 0,
          "totalDeductions": 0
        },
        "netPayable": 47352,
        "currency": "INR"
      },
      "_id": "6ada3b673bbfd4bbed8468e8",
      "payroll": "6ada3b673bbfd4bbed8468e7",
      "__v": 0,
      "companyName": "TechNeest",
      "createdAt": "2026-10-22T16:35:51.722Z",
      "emailDeliveryStatus": "Pending",
      "emailRetryCount": 2,
      "employee": "6ada3b63c2a389171d9e3cce",
      "employeeId": "WB-024",
      "fileName": "PS-202610-WB-024.pdf",
      "generatedAt": "2026-10-22T16:35:51.709Z",
      "generatedBy": "6ada3b62c2a389171d9e3cc6",
      "lastEmailAttemptAt": "2026-10-22T16:35:51.922Z",
      "month": 10,
      "payslipNumber": "PS-202610-WB-024",
      "updatedAt": "2026-10-22T16:35:51.923Z",
      "year": 2026
    },
    "emailDelivery": {
      "sent": false,
      "status": "Pending",
      "warning": "SMTP credentials are not configured in environment variables. Email preserved in Pending state.",
      "emailLogId": "6ada3b67c2a389171d9e3d03"
    }
  }
}
```

### Test 41: Admin Views SMTP Email Logs
- **Endpoint**: `GET /api/v1/admin/payroll/email-logs`
- **Scenario**: Verify EmailLog records delivery attempts
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Email delivery logs fetched successfully",
  "data": [
    {
      "_id": "6ada3b67c2a389171d9e3d03",
      "recipientEmail": "rahul.sharma@company.com",
      "recipientName": "Rahul Sharma",
      "subject": "Salary Slip for October 2026 — TechNeest",
      "templateName": "PAYSLIP_DELIVERY",
      "relatedEntityType": "Payslip",
      "relatedEntityId": "6ada3b673bbfd4bbed8468e8",
      "status": "Pending",
      "attempts": 0,
      "maxRetries": 2,
      "messageId": null,
      "errorMessage": "SMTP credentials are not configured in environment variables. Email preserved in Pending state.",
      "sentAt": null,
      "createdAt": "2026-10-22T16:35:51.921Z",
      "updatedAt": "2026-10-22T16:35:51.922Z",
      "__v": 0
    },
    {
      "_id": "6ada3b67c2a389171d9e3cfe",
      "recipientEmail": "rahul.sharma@company.com",
      "recipientName": "Rahul Sharma",
      "subject": "Salary Slip for October 2026 — TechNeest",
      "templateName": "PAYSLIP_DELIVERY",
      "relatedEntityType": "Payslip",
      "relatedEntityId": "6ada3b673bbfd4bbed8468e8",
      "status": "Pending",
      "attempts": 0,
      "maxRetries": 2,
      "messageId": null,
      "errorMessage": "SMTP credentials are not configured in environment variables. Email preserved in Pending state.",
      "sentAt": null,
      "createdAt": "2026-10-22T16:35:51.728Z",
      "updatedAt": "2026-10-22T16:35:51.729Z",
      "__v": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

### Test 42: Admin Assigns Task
- **Endpoint**: `POST /api/v1/admin/tasks`
- **Scenario**: Admin assigns task to Rahul Sharma
- **HTTP Status**: `201` (Expected: `201`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Task assigned successfully",
  "data": {
    "title": "Landing page responsive UI",
    "description": "",
    "project": "Website Redesign",
    "taskType": "AdminAssigned",
    "assignee": "6ada3b63c2a389171d9e3cce",
    "assigneeName": "Rahul Sharma",
    "assigneeEmployeeId": "WB-024",
    "assignedByAdmin": "6ada3b62c2a389171d9e3cc6",
    "priority": "High",
    "status": "Assigned",
    "startDate": "2026-10-20T00:00:00.000Z",
    "dueDate": "2026-10-25T12:30:00.000Z",
    "completedAt": null,
    "notifyEmployee": true,
    "repeatTask": "No repeat",
    "checklist": [
      {
        "text": "Hero section",
        "completed": false,
        "_id": "6ada3b67c2a389171d9e3d05"
      },
      {
        "text": "Footer",
        "completed": false,
        "_id": "6ada3b67c2a389171d9e3d06"
      }
    ],
    "attachments": [],
    "isDraft": false,
    "isDeleted": false,
    "_id": "6ada3b67c2a389171d9e3d04",
    "createdAt": "2026-10-22T16:35:51.944Z",
    "updatedAt": "2026-10-22T16:35:51.944Z",
    "__v": 0
  }
}
```

### Test 43: Employee Creates Personal Task
- **Endpoint**: `POST /api/v1/employee/tasks`
- **Scenario**: Employee creates a personal task on /create-task
- **HTTP Status**: `201` (Expected: `201`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Personal task created successfully",
  "data": {
    "title": "Complete React 19 performance guide",
    "description": "Self-study notes",
    "project": "Personal development",
    "taskType": "Personal",
    "assignee": "6ada3b63c2a389171d9e3cce",
    "assigneeName": "Rahul Sharma",
    "assigneeEmployeeId": "WB-024",
    "assignedByAdmin": null,
    "priority": "Medium",
    "status": "To Do",
    "startDate": "2026-10-22T16:35:51.955Z",
    "dueDate": "2026-10-28T00:00:00.000Z",
    "completedAt": null,
    "notifyEmployee": false,
    "repeatTask": "No repeat",
    "isDraft": false,
    "isDeleted": false,
    "_id": "6ada3b67c2a389171d9e3d09",
    "checklist": [],
    "attachments": [],
    "createdAt": "2026-10-22T16:35:51.956Z",
    "updatedAt": "2026-10-22T16:35:51.956Z",
    "__v": 0
  }
}
```

### Test 44: Employee Updates Assigned Task Status
- **Endpoint**: `PATCH /api/v1/employee/tasks/6ada3b67c2a389171d9e3d04`
- **Scenario**: Employee marks assigned task as Completed
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "6ada3b67c2a389171d9e3d04",
    "title": "Landing page responsive UI",
    "description": "",
    "project": "Website Redesign",
    "taskType": "AdminAssigned",
    "assignee": "6ada3b63c2a389171d9e3cce",
    "assigneeName": "Rahul Sharma",
    "assigneeEmployeeId": "WB-024",
    "assignedByAdmin": "6ada3b62c2a389171d9e3cc6",
    "priority": "High",
    "status": "Completed",
    "startDate": "2026-10-20T00:00:00.000Z",
    "dueDate": "2026-10-25T12:30:00.000Z",
    "completedAt": "2026-10-22T16:35:51.967Z",
    "notifyEmployee": true,
    "repeatTask": "No repeat",
    "checklist": [
      {
        "text": "Hero section",
        "completed": false,
        "_id": "6ada3b67c2a389171d9e3d05"
      },
      {
        "text": "Footer",
        "completed": false,
        "_id": "6ada3b67c2a389171d9e3d06"
      }
    ],
    "attachments": [],
    "isDraft": false,
    "isDeleted": false,
    "createdAt": "2026-10-22T16:35:51.944Z",
    "updatedAt": "2026-10-22T16:35:51.968Z",
    "__v": 0
  }
}
```

### Test 45: Admin Dashboard Overview
- **Endpoint**: `GET /api/v1/admin/dashboard`
- **Scenario**: Fetch Admin Dashboard cards, sidebar stats, recent team activity, and attendance overview
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Dashboard overview fetched successfully",
  "data": {
    "date": "2026-10-22",
    "statsCards": {
      "totalEmployees": 2,
      "activeNow": 2,
      "totalTasks": 2,
      "completedTasks": 1,
      "inProgress": 0,
      "pendingTasks": 1,
      "attendanceTodayLabel": "1/2",
      "presentToday": 1,
      "absentToday": 1
    },
    "sidebarQuickStats": {
      "employees": 2,
      "activeToday": 1,
      "tasksDone": 1,
      "pending": 1
    },
    "recentTeamActivity": [
      {
        "id": "6ada3b67c2a389171d9e3d04",
        "name": "Rahul Sharma",
        "employeeId": "WB-024",
        "initials": "RS",
        "task": "Landing page responsive UI",
        "status": "Completed",
        "time": "10:05 PM"
      },
      {
        "id": "6ada3b67c2a389171d9e3d09",
        "name": "Rahul Sharma",
        "employeeId": "WB-024",
        "initials": "RS",
        "task": "Complete React 19 performance guide",
        "status": "To Do",
        "time": "10:05 PM"
      }
    ],
    "attendanceOverview": {
      "percentage": 50,
      "present": 1,
      "absent": 1,
      "total": 2,
      "departmentWiseAttendance": [
        {
          "department": "Development",
          "present": 1,
          "total": 1,
          "label": "1/1",
          "percentage": 100
        },
        {
          "department": "QA",
          "present": 0,
          "total": 1,
          "label": "0/1",
          "percentage": 0
        }
      ]
    }
  }
}
```

### Test 46: Admin Analytics Reports
- **Endpoint**: `GET /api/v1/admin/reports`
- **Scenario**: Fetch team performance report and weekly task chart
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Reports & analytics fetched successfully",
  "data": {
    "topStats": {
      "totalEmployees": 2,
      "tasksCompletedWeek": 1,
      "avgHoursLogged": "9h 00m",
      "avgMinutesLogged": 540
    },
    "weeklyData": [
      {
        "day": "MON",
        "tasks": 0
      },
      {
        "day": "TUE",
        "tasks": 0
      },
      {
        "day": "WED",
        "tasks": 0
      },
      {
        "day": "THU",
        "tasks": 1
      },
      {
        "day": "FRI",
        "tasks": 0
      }
    ]
  }
}
```

### Test 47: Admin Departments List
- **Endpoint**: `GET /api/v1/admin/departments`
- **Scenario**: Fetch departments with team size and task completion rate
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Departments fetched successfully",
  "data": {
    "totalDepartments": 2,
    "departments": [
      {
        "_id": "6ada3b63c2a389171d9e3ccc",
        "id": "6ada3b63c2a389171d9e3ccc",
        "name": "Development",
        "code": "DEV",
        "description": "Frontend and Backend Engineering",
        "icon": "Building2",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "border": "hover:border-blue-500/40",
        "designations": [
          "Frontend Dev",
          "Backend Dev"
        ],
        "teamSize": 1,
        "employees": [
          {
            "_id": "6ada3b63c2a389171d9e3cce",
            "id": "WB-024",
            "name": "Rahul Sharma",
            "role": "Frontend Dev",
            "email": "rahul.sharma@company.com",
            "status": "Active"
          }
        ],
        "activeTasks": 1,
        "completedTasks": 1,
        "totalTasks": 2,
        "completionRate": 50
      },
      {
        "_id": "6ada3b64c2a389171d9e3cd0",
        "id": "6ada3b64c2a389171d9e3cd0",
        "name": "QA",
        "code": "QA-055",
        "description": "",
        "icon": "Building2",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "border": "hover:border-blue-500/40",
        "designations": [
          "QA Engineer"
        ],
        "teamSize": 1,
        "employees": [
          {
            "_id": "6ada3b64c2a389171d9e3cd1",
            "id": "WB-019",
            "name": "Priya Verma",
            "role": "QA Engineer",
            "email": "priya.v@company.com",
            "status": "Active"
          }
        ],
        "activeTasks": 0,
        "completedTasks": 0,
        "totalTasks": 0,
        "completionRate": 0
      }
    ]
  }
}
```

### Test 48: Admin Update Settings & Attendance Policy
- **Endpoint**: `PUT /api/v1/admin/settings`
- **Scenario**: Update standard login/logout times and toggles
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Settings saved successfully",
  "data": {
    "settings": {
      "loginTime": "09:00",
      "logoutTime": "18:00",
      "lateThreshold": "09:30",
      "autoAbsent": true,
      "overtimeApproval": true,
      "emailNotifications": true,
      "pushNotifications": false,
      "ipWhitelisting": false,
      "allowedIpAddresses": []
    },
    "policy": {
      "_id": "6ada3b66c2a389171d9e3cda",
      "name": "Standard Office Hours",
      "code": "STANDARD_OFFICE",
      "isDefault": true,
      "timezone": "Asia/Kolkata",
      "standardLoginTime": "09:00",
      "lateThresholdTime": "09:30",
      "gracePeriodMinutes": 30,
      "standardLogoutTime": "18:00",
      "earlyCheckoutThresholdMinutes": 15,
      "fullDayMinHours": 8,
      "halfDayMinHours": 4,
      "overtimeMinMinutesAfterShift": 30,
      "overtimeRequiresApproval": true,
      "autoMarkAbsent": true,
      "ipWhitelistingEnabled": false,
      "allowedIpAddresses": [],
      "emailNotificationsEnabled": true,
      "pushNotificationsEnabled": false,
      "weeklyOffDays": [
        0
      ],
      "saturdayHalfDay": false,
      "monthlyWorkingDaysOverride": {
        "2026-10": 24
      },
      "createdAt": "2026-10-22T16:35:50.592Z",
      "updatedAt": "2026-10-22T16:35:50.702Z",
      "__v": 0
    }
  }
}
```

### Test 49: Admin Views System Audit Logs
- **Endpoint**: `GET /api/v1/admin/audit-logs`
- **Scenario**: Fetch security and administrative audit logs
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "System audit logs fetched successfully",
  "data": [
    {
      "_id": "6ada3b68c2a389171d9e3d10",
      "actorType": "Admin",
      "actorId": "6ada3b62c2a389171d9e3cc6",
      "actorEmail": "admin@workboard.com",
      "action": "SETTINGS_UPDATED",
      "module": "SETTINGS",
      "targetId": "6ada3b66c2a389171d9e3cda",
      "description": "Updated system settings and attendance policy configuration",
      "changes": null,
      "ipAddress": "127.0.0.1",
      "userAgent": "Techneest-HTTP-TestRunner/1.0 (macOS)",
      "createdAt": "2026-10-22T16:35:52.005Z",
      "updatedAt": "2026-10-22T16:35:52.005Z",
      "__v": 0
    },
    {
      "_id": "6ada3b67c2a389171d9e3d08",
      "actorType": "Admin",
      "actorId": "6ada3b62c2a389171d9e3cc6",
      "actorEmail": "admin@workboard.com",
      "action": "TASK_ASSIGNED",
      "module": "TASK",
      "targetId": "6ada3b67c2a389171d9e3d04",
      "description": "Assigned task \"Landing page responsive UI\" to Rahul Sharma (WB-024)",
      "changes": null,
      "ipAddress": "127.0.0.1",
      "userAgent": "Techneest-HTTP-TestRunner/1.0 (macOS)",
      "createdAt": "2026-10-22T16:35:51.946Z",
      "updatedAt": "2026-10-22T16:35:51.946Z",
      "__v": 0
    },
    {
      "_id": "6ada3b67c2a389171d9e3d02",
      "actorType": "Admin",
      "actorId": "6ada3b62c2a389171d9e3cc6",
      "actorEmail": "admin@workboard.com",
      "action": "PAYROLL_PAYMENT_STATUS_UPDATED",
      "module": "PAYROLL",
      "targetId": "6ada3b673bbfd4bbed8468e7",
      "description": "Updated payment status for WB-024 (October 2026) to Paid",
      "changes": null,
      "ipAddress": "127.0.0.1",
      "userAgent": "Techneest-HTTP-TestRunner/1.0 (macOS)",
      "createdAt": "2026-10-22T16:35:51.750Z",
      "updatedAt": "2026-10-22T16:35:51.750Z",
      "__v": 0
    },
    {
      "_id": "6ada3b67c2a389171d9e3cff",
      "actorType": "Admin",
      "actorId": "6ada3b62c2a389171d9e3cc6",
      "actorEmail": "admin@workboard.com",
      "action": "PAYROLL_FINALIZED_AND_PAYSLIP_GENERATED",
      "module": "PAYROLL",
      "targetId": "6ada3b673bbfd4bbed8468e7",
      "description": "Finalized payroll and generated payslip PS-202610-WB-024 for WB-024",
      "changes": null,
      "ipAddress": "127.0.0.1",
      "userAgent": "Techneest-HTTP-TestRunner/1.0 (macOS)",
      "createdAt": "2026-10-22T16:35:51.732Z",
      "updatedAt": "2026-10-22T16:35:51.732Z",
      "__v": 0
    },
    {
      "_id": "6ada3b67c2a389171d9e3cfc",
      "actorType": "Admin",
      "actorId": "6ada3b62c2a389171d9e3cc6",
      "actorEmail": "admin@workboard.com",
      "action": "PAYROLL_APPROVED",
      "module": "PAYROLL",
      "targetId": "6ada3b673bbfd4bbed8468e7",
      "description": "Approved payroll for WB-024 (October 2026). Payment status remains Pending.",
      "changes": null,
      "ipAddress": "127.0.0.1",
      "userAgent": "Techneest-HTTP-TestRunner/1.0 (macOS)",
      "createdAt": "2026-10-22T16:35:51.699Z",
      "updatedAt": "2026-10-22T16:35:51.699Z",
      "__v": 0
    },
    {
      "_id": "6ada3b67c2a389171d9e3cfa",
      "actorType": "Admin",
      "actorId": "6ada3b62c2a389171d9e3cc6",
      "actorEmail": "admin@workboard.com",
      "action": "PAYROLL_ADJUSTMENT_ADDED",
      "module": "PAYROLL",
      "targetId": "6ada3b673bbfd4bbed8468e7",
      "description": "Added Bonus (Diwali Performance Bonus: INR 2000) to payroll WB-024 (October 2026)",
      "changes": null,
      "ipAddress": "127.0.0.1",
      "userAgent": "Techneest-HTTP-TestRunner/1.0 (macOS)",
      "createdAt": "2026-10-22T16:35:51.688Z",
      "updatedAt": "2026-10-22T16:35:51.688Z",
      "__v": 0
    },
    {
      "_id": "6ada3b67c2a389171d9e3cf8",
      "actorType": "Admin",
      "actorId": "6ada3b62c2a389171d9e3cc6",
      "actorEmail": "admin@workboard.com",
      "action": "PAYROLL_CALCULATED",
      "module": "PAYROLL",
      "targetId": "2026-10",
      "description": "Generated/recalculated payroll for 1 employee(s) for October 2026",
      "changes": null,
      "ipAddress": "127.0.0.1",
      "userAgent": "Techneest-HTTP-TestRunner/1.0 (macOS)",
      "createdAt": "2026-10-22T16:35:51.663Z",
      "updatedAt": "2026-10-22T16:35:51.663Z",
      "__v": 0
    },
    {
      "_id": "6ada3b67c2a389171d9e3cf7",
      "actorType": "Admin",
      "actorId": "6ada3b62c2a389171d9e3cc6",
      "actorEmail": "admin@workboard.com",
      "action": "LEAVE_APPROVED",
      "module": "LEAVE",
      "targetId": "6ada3b66c2a389171d9e3cf6",
      "description": "Approved leave request for WB-024 (2026-10-26 to 2026-10-27)",
      "changes": null,
      "ipAddress": "127.0.0.1",
      "userAgent": "Techneest-HTTP-TestRunner/1.0 (macOS)",
      "createdAt": "2026-10-22T16:35:51.239Z",
      "updatedAt": "2026-10-22T16:35:51.239Z",
      "__v": 0
    },
    {
      "_id": "6ada3b66c2a389171d9e3cd9",
      "actorType": "Employee",
      "actorId": "6ada3b64c2a389171d9e3cd1",
      "actorEmail": "priya.v@company.com",
      "action": "EMPLOYEE_LOGIN_SUCCESS",
      "module": "AUTH",
      "targetId": "WB-019",
      "description": "Employee Priya Verma (WB-019) logged in",
      "changes": null,
      "ipAddress": "127.0.0.1",
      "userAgent": "Techneest-HTTP-TestRunner/1.0 (macOS)",
      "createdAt": "2026-10-22T16:35:50.307Z",
      "updatedAt": "2026-10-22T16:35:50.307Z",
      "__v": 0
    },
    {
      "_id": "6ada3b65c2a389171d9e3cd6",
      "actorType": "Employee",
      "actorId": "6ada3b63c2a389171d9e3cce",
      "actorEmail": "rahul.sharma@company.com",
      "action": "EMPLOYEE_LOGIN_SUCCESS",
      "module": "AUTH",
      "targetId": "WB-024",
      "description": "Employee Rahul Sharma (WB-024) logged in",
      "changes": null,
      "ipAddress": "127.0.0.1",
      "userAgent": "Techneest-HTTP-TestRunner/1.0 (macOS)",
      "createdAt": "2026-10-22T16:35:49.507Z",
      "updatedAt": "2026-10-22T16:35:49.507Z",
      "__v": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 16,
    "totalPages": 2
  }
}
```

### Test 50: Employee Dashboard Overview
- **Endpoint**: `GET /api/v1/employee/dashboard`
- **Scenario**: Fetch employee dashboard stats, priority tasks, and today's attendance
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Employee dashboard fetched successfully",
  "data": {
    "statsCards": {
      "assignedTasks": 1,
      "completedThisWeek": 1,
      "inProgress": 0,
      "hoursLoggedToday": "9h 00m"
    },
    "sidebarQuickStats": {
      "assigned": 1,
      "done": 1,
      "workHours": "9h"
    },
    "priorityTasks": [
      {
        "_id": "6ada3b67c2a389171d9e3d09",
        "title": "Complete React 19 performance guide",
        "description": "Self-study notes",
        "project": "Personal development",
        "taskType": "Personal",
        "assignee": "6ada3b63c2a389171d9e3cce",
        "assigneeName": "Rahul Sharma",
        "assigneeEmployeeId": "WB-024",
        "assignedByAdmin": null,
        "priority": "Medium",
        "status": "To Do",
        "startDate": "2026-10-22T16:35:51.955Z",
        "dueDate": "2026-10-28T00:00:00.000Z",
        "completedAt": null,
        "notifyEmployee": false,
        "repeatTask": "No repeat",
        "isDraft": false,
        "isDeleted": false,
        "checklist": [],
        "attachments": [],
        "createdAt": "2026-10-22T16:35:51.956Z",
        "updatedAt": "2026-10-22T16:35:51.956Z",
        "__v": 0
      }
    ],
    "todaysAttendance": {
      "isClockedIn": false,
      "clockInTime": "09:00 AM",
      "clockOutTime": "06:00 PM",
      "workedSoFar": "9h 00m",
      "status": "Present",
      "approvalStatus": "Approved"
    }
  }
}
```

### Test 51: Employee Work Reports & Profile
- **Endpoint**: `GET /api/v1/employee/reports-profile`
- **Scenario**: Fetch employee weekly productivity chart, profile, and recently completed tasks
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Employee work reports and profile fetched successfully",
  "data": {
    "profile": {
      "_id": "6ada3b63c2a389171d9e3cce",
      "employeeId": "WB-024",
      "fullName": "Rahul Sharma",
      "email": "rahul.sharma@company.com",
      "phone": "+91-9876543210",
      "department": "Development",
      "role": "Frontend Dev",
      "designation": "Senior Frontend Developer",
      "joiningDate": "2023-01-15T00:00:00.000Z",
      "status": "Active"
    },
    "weeklyProductivity": [
      {
        "day": "MON",
        "value": 0
      },
      {
        "day": "TUE",
        "value": 0
      },
      {
        "day": "WED",
        "value": 0
      },
      {
        "day": "THU",
        "value": 1
      },
      {
        "day": "FRI",
        "value": 0
      }
    ],
    "recentlyCompleted": [
      {
        "id": "6ada3b67c2a389171d9e3d04",
        "title": "Landing page responsive UI",
        "project": "Website Redesign",
        "completedAt": "2026-10-22T16:35:51.967Z"
      }
    ]
  }
}
```

### Test 52: Employee Logout
- **Endpoint**: `POST /api/v1/employee/auth/logout`
- **Scenario**: Employee logs out; records logoutTimestampUTC and sessionDurationMinutes
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Employee logged out successfully",
  "data": {
    "loggedOutAt": "2026-10-22T16:35:52.053Z",
    "logoutTimeIST": "10:05 PM"
  }
}
```

### Test 53: Admin Logout
- **Endpoint**: `POST /api/v1/admin/auth/logout`
- **Scenario**: Admin logs out and invalidates session
- **HTTP Status**: `200` (Expected: `200`)
- **Status**: **PASS**
- **Remaining Issue**: None
- **Actual Sanitized Response**:
```json
{
  "success": true,
  "message": "Admin logged out successfully",
  "data": {
    "loggedOutAt": "2026-10-22T16:35:52.064Z",
    "logoutTimeIST": "10:05 PM"
  }
}
```

