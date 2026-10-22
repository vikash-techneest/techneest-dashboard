# TechNeest Backend — Complete API Response Reference

Total Documented Endpoints: **101**

All endpoints return a consistent JSON structure:
- **Success**: `{ "success": true, "message": "...", "data": ..., "pagination": ... }`
- **Error**: `{ "success": false, "message": "...", "errors": [{ "field": "...", "message": "..." }] }`

---

## 1. Root API Welcome

1. **API Name**: Root API Welcome
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/`
4. **Purpose**: Verify API service availability and version.
5. **Required Authentication**: Public (None)
6. **Required Role / Permission**: `None`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Techneest Dashboard API is running",
  "version": "1.0.0"
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Too many requests from this IP. Please try again later."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Returns service status banner.

---

## 2. System Health & Database/SMTP Status

1. **API Name**: System Health & Database/SMTP Status
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/health`
4. **Purpose**: Check MongoDB connection state, SMTP configuration readiness, and server timezone.
5. **Required Authentication**: Public (None)
6. **Required Role / Permission**: `None`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "System health status",
  "data": {
    "database": "connected",
    "smtpConfigured": false,
    "timezone": "Asia/Kolkata",
    "timestamp": "2026-10-22T16:30:00.000Z"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Internal server error"
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Reports database connectivity ('connected'/'disconnected') and SMTP readiness.

---

## 3. Initial Admin Setup (Bootstrap)

1. **API Name**: Initial Admin Setup (Bootstrap)
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/auth/setup`
4. **Purpose**: Securely create the initial super_admin account without hardcoded credentials.
5. **Required Authentication**: Public (Locked after first admin unless ADMIN_SETUP_KEY is provided)
6. **Required Role / Permission**: `None (Bootstrap)`
7. **Request Body**:
```json
{
  "fullName": "Vikram Admin",
  "email": "admin@workboard.com",
  "password": "AdminStrongPassword123!",
  "setupSecretKey": "optional_if_first_admin"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Initial administrator account configured successfully",
  "data": {
    "admin": {
      "_id": "6717b0000000000000000001",
      "fullName": "Vikram Admin",
      "email": "admin@workboard.com",
      "role": "super_admin",
      "status": "Active"
    }
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Initial admin setup is locked because an administrator account already exists."
}
```
11. **HTTP Status Codes**: 201 Created, 400 Bad Request, 403 Forbidden, 409 Conflict
12. **Important Business Rules**: Fails with 403 if an admin already exists and setupSecretKey does not match process.env.ADMIN_SETUP_KEY.

---

## 4. Admin Login

1. **API Name**: Admin Login
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/auth/login`
4. **Purpose**: Authenticate admin credentials (intended for frontend route /admin/login), issue JWT access + refresh tokens, and record LoginHistory & Session.
5. **Required Authentication**: Public (Rate-limited)
6. **Required Role / Permission**: `Admin account`
7. **Request Body**:
```json
{
  "email": "admin@workboard.com",
  "password": "AdminStrongPassword123!",
  "rememberMe": true
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "data": {
    "admin": {
      "_id": "6717b0000000000000000001",
      "fullName": "Vikram Admin",
      "email": "admin@workboard.com",
      "role": "super_admin",
      "status": "Active"
    },
    "accessToken": "<REDACTED_JWT_TOKEN>",
    "refreshToken": "<REDACTED_JWT_TOKEN>",
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "ipAddress": "127.0.0.1"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Invalid Credentials. Please check your email and password."
}
```
11. **HTTP Status Codes**: 200 OK, 400 Validation Error, 401 Unauthorized, 423 Locked, 429 Too Many Requests
12. **Important Business Rules**: Locks account for 15 minutes after 5 consecutive failed attempts. Records IP and device/browser metadata.

---

## 5. Rotate Admin Refresh Token

1. **API Name**: Rotate Admin Refresh Token
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/auth/refresh`
4. **Purpose**: Rotate refresh token and obtain a new short-lived access token and refresh token.
5. **Required Authentication**: Refresh Token (Body or HTTP-only Cookie)
6. **Required Role / Permission**: `Admin`
7. **Request Body**:
```json
{
  "refreshToken": "{{adminRefreshToken}}"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "<REDACTED_JWT_TOKEN>",
    "refreshToken": "<REDACTED_JWT_TOKEN>",
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Refresh token has been revoked or already rotated"
}
```
11. **HTTP Status Codes**: 200 OK, 401 Unauthorized
12. **Important Business Rules**: Detects token reuse: if an old refresh token is replayed, the entire session is immediately revoked.

---

## 6. Admin Logout

1. **API Name**: Admin Logout
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/auth/logout`
4. **Purpose**: Terminate current admin session, clear auth cookies, and record logout timestamp in LoginHistory.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `Authenticated Admin`
7. **Request Body**:
```json
{}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Admin logged out successfully",
  "data": {
    "loggedOutAt": "2026-10-22T16:35:00.000Z",
    "logoutTimeIST": "10:05 PM"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required. Please provide a valid admin token."
}
```
11. **HTTP Status Codes**: 200 OK, 401 Unauthorized
12. **Important Business Rules**: Marks session status as LoggedOut and calculates total session duration.

---

## 7. Get Admin Profile

1. **API Name**: Get Admin Profile
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/auth/profile`
4. **Purpose**: Fetch authenticated admin's profile, permissions, and current session ID.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `Authenticated Admin`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Admin profile fetched successfully",
  "data": {
    "admin": {
      "_id": "6717b0000000000000000001",
      "fullName": "Vikram Admin",
      "email": "admin@workboard.com",
      "role": "super_admin",
      "status": "Active"
    },
    "currentSessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Invalid or expired authentication token"
}
```
11. **HTTP Status Codes**: 200 OK, 401 Unauthorized
12. **Important Business Rules**: Never exposes password hash or reset tokens.

---

## 8. Update Admin Profile

1. **API Name**: Update Admin Profile
2. **HTTP Method**: `PUT`
3. **Complete Endpoint**: `/api/v1/admin/auth/profile`
4. **Purpose**: Update admin display name.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `Authenticated Admin`
7. **Request Body**:
```json
{
  "fullName": "Vikram Singh (Super Admin)"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Admin profile updated successfully",
  "data": {
    "admin": {
      "fullName": "Vikram Singh (Super Admin)",
      "email": "admin@workboard.com"
    }
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK, 401 Unauthorized
12. **Important Business Rules**: Updates fullName on the authenticated admin profile.

---

## 9. Change Admin Password

1. **API Name**: Change Admin Password
2. **HTTP Method**: `PUT`
3. **Complete Endpoint**: `/api/v1/admin/auth/change-password`
4. **Purpose**: Change authenticated admin's password after verifying current password.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `Authenticated Admin`
7. **Request Body**:
```json
{
  "currentPassword": "AdminStrongPassword123!",
  "newPassword": "NewAdminStrongPassword456!"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```
11. **HTTP Status Codes**: 200 OK, 400 Bad Request, 401 Unauthorized
12. **Important Business Rules**: Hashes new password with bcrypt (cost 12) and revokes other active sessions.

---

## 10. Admin Forgot Password

1. **API Name**: Admin Forgot Password
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/auth/forgot-password`
4. **Purpose**: Generate a time-limited SHA-256 hashed password reset token and email it via SMTP.
5. **Required Authentication**: Public (Rate-limited)
6. **Required Role / Permission**: `None`
7. **Request Body**:
```json
{
  "email": "admin@workboard.com"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Password reset request processed",
  "data": {
    "emailSent": false,
    "emailStatus": "Pending",
    "expiresInMinutes": 30
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```
11. **HTTP Status Codes**: 200 OK, 400 Validation Error
12. **Important Business Rules**: Prevents email enumeration by returning 200 regardless of whether email exists. Token expires in 30m.

---

## 11. Admin Reset Password

1. **API Name**: Admin Reset Password
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/auth/reset-password`
4. **Purpose**: Reset admin password using the token received via email.
5. **Required Authentication**: Public (Rate-limited)
6. **Required Role / Permission**: `None`
7. **Request Body**:
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewAdminStrongPassword123!"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please log in with your new password.",
  "data": null
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Password reset token is invalid or has expired"
}
```
11. **HTTP Status Codes**: 200 OK, 400 Invalid/Expired Token
12. **Important Business Rules**: Clears lockout state, updates password hash, and revokes all active sessions.

---

## 12. List Admin Sessions

1. **API Name**: List Admin Sessions
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/auth/sessions`
4. **Purpose**: View active and past login sessions for the authenticated admin.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `Authenticated Admin`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Admin sessions fetched successfully",
  "data": [
    {
      "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "userType": "Admin",
      "ipAddress": "127.0.0.1",
      "status": "Active"
    }
  ]
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK, 401 Unauthorized
12. **Important Business Rules**: Excludes refreshTokenHash from response.

---

## 13. Revoke Admin Session

1. **API Name**: Revoke Admin Session
2. **HTTP Method**: `DELETE`
3. **Complete Endpoint**: `/api/v1/admin/auth/sessions/:sessionId`
4. **Purpose**: Revoke a specific admin session by sessionId.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `Authenticated Admin`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Session revoked successfully",
  "data": {
    "sessionId": "a1b2c3d4",
    "status": "Revoked"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Session not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Immediately invalidates the session for future access or refresh requests.

---

## 14. Get Admin Login Audit History

1. **API Name**: Get Admin Login Audit History
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/auth/login-history`
4. **Purpose**: Fetch paginated login audit history for admin accounts.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `Authenticated Admin`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `status`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Admin login audit history fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK, 401 Unauthorized
12. **Important Business Rules**: Includes successful, failed, and locked login attempts with IP and browser metadata.

---

## 15. Get Admin Dashboard Overview

1. **API Name**: Get Admin Dashboard Overview
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/dashboard`
4. **Purpose**: Supply all data for /admin/dashboard and Sidebar Quick Stats (6 top cards, recent team activity, circular attendance overview, department-wise attendance progress).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `dashboard:view`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Dashboard overview fetched successfully",
  "data": {
    "date": "2026-10-22",
    "statsCards": {
      "totalEmployees": 24,
      "activeNow": 18,
      "totalTasks": 178,
      "completedTasks": 146,
      "inProgress": 32,
      "attendanceTodayLabel": "21/24"
    },
    "recentTeamActivity": [],
    "attendanceOverview": {
      "percentage": 88,
      "present": 21,
      "absent": 3,
      "total": 24,
      "departmentWiseAttendance": []
    }
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Forbidden: Admin privileges required to access this resource"
}
```
11. **HTTP Status Codes**: 200 OK, 401 Unauthorized, 403 Forbidden
12. **Important Business Rules**: Aggregates live counts across Employee, Session, Task, Attendance, and Department collections.

---

## 16. Global Topbar Search

1. **API Name**: Global Topbar Search
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/search`
4. **Purpose**: Search across employees, tasks, and departments from the Topbar search input.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `Authenticated Admin`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `q`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Search results fetched successfully",
  "data": {
    "employees": [],
    "tasks": [],
    "departments": []
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Uses regex-escaped safe matching across employee names/IDs/emails, task titles, and departments.

---

## 17. Get Team Performance & Analytics Reports

1. **API Name**: Get Team Performance & Analytics Reports
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/reports`
4. **Purpose**: Supply data for /admin/reports (Total Employees, Tasks Completed this week, Avg. Hours Logged, MON-FRI bar chart).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `reports:view`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Reports & analytics fetched successfully",
  "data": {
    "topStats": {
      "totalEmployees": 2,
      "tasksCompletedWeek": 1,
      "avgHoursLogged": "9h 00m"
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
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Forbidden: Missing required permission (reports:view)"
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Calculates average hours logged and daily task completions for the current week.

---

## 18. Export Performance Report CSV

1. **API Name**: Export Performance Report CSV
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/reports/export/csv`
4. **Purpose**: Export team productivity and attendance report as CSV.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `reports:view`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Performance report exported successfully",
  "data": {
    "fileName": "Performance_Report_2026-10-22.csv",
    "totalRecords": 2,
    "csv": "Employee ID,Name,Department..."
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Generates CSV with employee task completion and current month present days.

---

## 19. Create Employee

1. **API Name**: Create Employee
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/employees`
4. **Purpose**: Create a new employee account (supports /admin/employee/add) and initialize their SalaryStructure.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:write`
7. **Request Body**:
```json
{
  "fullName": "Rahul Sharma",
  "employeeId": "WB-024",
  "email": "rahul.sharma@company.com",
  "password": "EmployeePass123!",
  "department": "Development",
  "role": "Frontend Dev",
  "joiningDate": "2023-01-15",
  "salary": 45000,
  "status": "Active",
  "loginAccess": "Email + temporary password",
  "attendancePolicy": "Standard office hours",
  "salaryCycle": "Monthly - calendar month"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employeeId": "WB-024",
    "fullName": "Rahul Sharma",
    "email": "rahul.sharma@company.com",
    "department": "Development",
    "role": "Frontend Dev",
    "baseSalary": 45000,
    "status": "Active"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```
11. **HTTP Status Codes**: 201 Created, 400 Validation Error, 409 Duplicate Email
12. **Important Business Rules**: Auto-generates WB-XXX code if employeeId is 'Auto-generated' or omitted. Hashes password with bcrypt and creates SalaryStructure.

---

## 20. List Employees (Paginated & Filtered)

1. **API Name**: List Employees (Paginated & Filtered)
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/employees`
4. **Purpose**: Fetch paginated employee directory with search, department, role, and status filters (/admin/employee).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `search`, `department`, `status`, `role`, `sortBy`, `sortOrder`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employees fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Forbidden: Admin privileges required to access this resource"
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Excludes soft-deleted employees and never returns password hashes.

---

## 21. Export Employees CSV

1. **API Name**: Export Employees CSV
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/employees/export/csv`
4. **Purpose**: Export employee directory as CSV (/admin/employee Export CSV button).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `format`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employees CSV generated successfully",
  "data": {
    "fileName": "Employees_2026-10-22.csv",
    "totalRecords": 2,
    "csv": "Employee ID,Full Name,Email..."
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Returns JSON with CSV string by default or raw text/csv stream when ?format=raw.

---

## 22. Get Employee Details & Monthly Attendance Calendar

1. **API Name**: Get Employee Details & Monthly Attendance Calendar
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/employees/:id`
4. **Purpose**: Fetch full employee profile, task completion stats, salary structure, and full-month day-by-day attendance calendar (/admin/employee/:id).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `month`, `year`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee details fetched successfully",
  "data": {
    "employee": {
      "employeeId": "WB-024",
      "fullName": "Rahul Sharma"
    },
    "taskStats": {
      "totalTasks": 1,
      "completedTasks": 1
    },
    "monthlyAttendance": {
      "month": 10,
      "year": 2026,
      "calendar": []
    }
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Employee not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Accepts either Mongo _id or employeeId code (e.g. WB-024).

---

## 23. Update Employee

1. **API Name**: Update Employee
2. **HTTP Method**: `PUT`
3. **Complete Endpoint**: `/api/v1/admin/employees/:id`
4. **Purpose**: Update employee details, department, role, salary, or account settings (/admin/employee/edit/:id).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:write`
7. **Request Body**:
```json
{
  "fullName": "Rahul Sharma",
  "phone": "+91-9876543210",
  "designation": "Senior Frontend Developer",
  "salary": 48000
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "employeeId": "WB-024",
    "fullName": "Rahul Sharma"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Employee not found"
}
```
11. **HTTP Status Codes**: 200 OK, 400 Validation Error, 404 Not Found
12. **Important Business Rules**: Whitelists updatable fields to prevent mass assignment and syncs baseSalary with SalaryStructure.

---

## 24. Activate / Deactivate / Suspend Employee

1. **API Name**: Activate / Deactivate / Suspend Employee
2. **HTTP Method**: `PATCH`
3. **Complete Endpoint**: `/api/v1/admin/employees/:id/status`
4. **Purpose**: Change employee account status between Active, Inactive, and Suspended.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:write`
7. **Request Body**:
```json
{
  "status": "Inactive"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee status updated to Inactive",
  "data": {
    "employeeId": "WB-024",
    "status": "Inactive"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Validation failed"
}
```
11. **HTTP Status Codes**: 200 OK, 400 Validation Error, 404 Not Found
12. **Important Business Rules**: Immediately revokes all active employee sessions when status is set to Inactive or Suspended.

---

## 25. Update Employee Role & Permissions

1. **API Name**: Update Employee Role & Permissions
2. **HTTP Method**: `PATCH`
3. **Complete Endpoint**: `/api/v1/admin/employees/:id/permissions`
4. **Purpose**: Assign fine-grained permissions and role/designation to an employee.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `roles:manage`
7. **Request Body**:
```json
{
  "role": "Team Lead",
  "permissions": [
    "self:profile:read",
    "self:attendance:mark",
    "self:tasks:manage"
  ]
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee role and permissions updated successfully",
  "data": {
    "employeeId": "WB-024",
    "role": "Team Lead",
    "permissions": []
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Employee not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Audits role and permission changes.

---

## 26. Soft-Delete Employee

1. **API Name**: Soft-Delete Employee
2. **HTTP Method**: `DELETE`
3. **Complete Endpoint**: `/api/v1/admin/employees/:id`
4. **Purpose**: Soft-delete an employee while preserving historical attendance and payroll records.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:delete`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee removed successfully",
  "data": {
    "employeeId": "WB-024",
    "isDeleted": true
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Employee not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Marks isDeleted=true, status='Inactive', and revokes active sessions.

---

## 27. List Employee Documents

1. **API Name**: List Employee Documents
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/employees/:id/documents`
4. **Purpose**: Fetch uploaded documents (ID Proof, Offer Letter, Resume, etc.) for an employee.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee documents fetched successfully",
  "data": []
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Employee not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Returns metadata array for employee documents.

---

## 28. Upload Employee Document

1. **API Name**: Upload Employee Document
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/employees/:id/documents`
4. **Purpose**: Upload a document file (via multipart/form-data or metadata) for an employee.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:write`
7. **Request Body**:
```json
{
  "title": "Signed Offer Letter",
  "type": "Offer Letter",
  "fileName": "offer_letter_wb024.pdf"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee document uploaded successfully",
  "data": {
    "title": "Signed Offer Letter",
    "type": "Offer Letter"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Document file or file metadata is required"
}
```
11. **HTTP Status Codes**: 201 Created, 400 Bad Request
12. **Important Business Rules**: Validates allowed MIME types and 5MB size limit.

---

## 29. Delete Employee Document

1. **API Name**: Delete Employee Document
2. **HTTP Method**: `DELETE`
3. **Complete Endpoint**: `/api/v1/admin/employees/:id/documents/:docId`
4. **Purpose**: Remove a specific document from an employee's record.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:write`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee document deleted successfully",
  "data": {
    "deletedDocumentId": "6717b0000000000000000099"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Employee document not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Removes subdocument by ID.

---

## 30. Get Employee-Specific Login History

1. **API Name**: Get Employee-Specific Login History
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/employees/:id/login-history`
4. **Purpose**: View login/logout timestamps, IP, device info, and session durations for a specific employee.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `date`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee login history fetched successfully",
  "data": {
    "employee": {
      "employeeId": "WB-024"
    },
    "history": []
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Employee not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Shows both UTC timestamps and Asia/Kolkata formatted dates/times.

---

## 31. Get Employee-Specific Attendance Summary

1. **API Name**: Get Employee-Specific Attendance Summary
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/employees/:id/attendance-summary`
4. **Purpose**: View monthly attendance summary, official register entries, and raw attendance submissions for an employee.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `attendance:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `month`, `year`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee attendance summary fetched successfully",
  "data": {
    "employeeId": "WB-024",
    "month": 10,
    "year": 2026,
    "summary": {
      "currentMonthPresentDays": 22,
      "totalWorkingDaysInMonth": 24
    },
    "officialRegisterRecords": [],
    "attendanceSubmissions": []
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Employee not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Separates pending attendance submissions from approved official register entries.

---

## 32. Get Employee-Specific Payroll History

1. **API Name**: Get Employee-Specific Payroll History
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/employees/:id/payroll-history`
4. **Purpose**: Fetch historical monthly payroll records for a specific employee.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payroll:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee payroll history fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Employee not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Returns paginated payroll records ordered by period.

---

## 33. Get Date-Wise & Employee-Wise Login History

1. **API Name**: Get Date-Wise & Employee-Wise Login History
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/activity/login-history`
4. **Purpose**: Filter and inspect employee login/logout records by date, employeeId, or session status.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `date`, `employeeId`, `status`, `search`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Login history fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Login activity is tracked separately from attendance; a login never auto-creates approved attendance.

---

## 34. Get Active Employee Sessions

1. **API Name**: Get Active Employee Sessions
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/activity/active-sessions`
4. **Purpose**: List all currently active employee sessions with live duration, IP, and device/browser metadata.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Active employee sessions fetched successfully",
  "data": []
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Calculates live sessionDurationMinutes from loginAt to current UTC time.

---

## 35. Get Employee Activity Summary

1. **API Name**: Get Employee Activity Summary
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/activity/summary`
4. **Purpose**: Get daily login count, active sessions count, total session duration today, and last login per employee.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `date`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee activity summary fetched successfully",
  "data": {
    "date": "2026-10-22",
    "timezone": "Asia/Kolkata",
    "totalActiveEmployees": 2,
    "activeSessionsCount": 1,
    "todayLoginCount": 2
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Reports times in Asia/Kolkata timezone.

---

## 36. Force Revoke Employee Session

1. **API Name**: Force Revoke Employee Session
2. **HTTP Method**: `DELETE`
3. **Complete Endpoint**: `/api/v1/admin/activity/sessions/:sessionId`
4. **Purpose**: Allow an admin to remotely terminate an active employee session.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `employees:write`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee session revoked successfully",
  "data": {
    "sessionId": "session-uuid",
    "status": "Revoked"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Employee session not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Marks both Session and LoginHistory as Revoked.

---

## 37. Get Daily Attendance Management Overview

1. **API Name**: Get Daily Attendance Management Overview
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/attendance`
4. **Purpose**: Supply data for /admin/attendance-management (4 top stats cards, filters by date/department/status, employee rows with streak bar).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `attendance:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `date`, `department`, `status`, `approvalStatus`, `search`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Attendance management records fetched successfully",
  "data": {
    "date": "2026-10-22",
    "totalWorkingDays": 24,
    "stats": {
      "totalEmployees": 2,
      "presentToday": 1,
      "absentToday": 1,
      "lateArrivals": 0,
      "hoursLoggedToday": 9
    },
    "records": []
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Returns Present Today, Absent, Late Arrivals, Hours Logged, and per-employee attendance status.

---

## 38. List Pending Attendance & Correction Requests

1. **API Name**: List Pending Attendance & Correction Requests
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/attendance/pending`
4. **Purpose**: List all employee attendance records in 'Pending' or 'Correction Requested' state awaiting admin review.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `attendance:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `date`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Pending attendance records fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Only authorized admins can review and approve these records.

---

## 39. Approve or Reject Attendance Record

1. **API Name**: Approve or Reject Attendance Record
2. **HTTP Method**: `PATCH`
3. **Complete Endpoint**: `/api/v1/admin/attendance/:id/review`
4. **Purpose**: Approve or reject an attendance record or correction request with a reason. On approval, transfers the record into the official AttendanceRegister (main sheet).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `attendance:approve`
7. **Request Body**:
```json
{
  "decision": "Approved",
  "reason": "Verified shift timings with team lead",
  "overrideStatus": "Present"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Attendance record approved successfully",
  "data": {
    "attendance": {
      "approvalStatus": "Approved",
      "attendanceStatus": "Present"
    },
    "registerRecord": {
      "officialStatus": "Present",
      "payableDayValue": 1
    },
    "updatedSummary": {
      "presentDays": 1,
      "totalWorkingDaysInMonth": 24
    }
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "decision",
      "message": "Decision must be 'Approved' or 'Rejected'"
    }
  ]
}
```
11. **HTTP Status Codes**: 200 OK, 400 Validation Error, 404 Not Found
12. **Important Business Rules**: Upserts into AttendanceRegister with unique index { employee, attendanceDate } so duplicate approved entries are impossible. Creates permanent AttendanceAudit log and refreshes employee attendanceSummary.

---

## 40. Get Official Attendance Register (Main Sheet)

1. **API Name**: Get Official Attendance Register (Main Sheet)
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/attendance/register`
4. **Purpose**: Query the official approved attendance register (main sheet) used by the payroll engine.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `attendance:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `month`, `year`, `employeeId`, `date`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Official attendance register fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Contains only admin-approved attendance entries and approved paid/unpaid leaves.

---

## 41. Get Permanent Attendance Audit Trail

1. **API Name**: Get Permanent Attendance Audit Trail
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/attendance/audit-logs`
4. **Purpose**: View immutable audit history of check-ins, check-outs, correction requests, approvals, rejections, and manual adjustments.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `attendance:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `employeeId`, `action`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Attendance approval audit trail fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Preserves both previousState and newState for every attendance action.

---

## 42. Bulk Manual Attendance Adjustment

1. **API Name**: Bulk Manual Attendance Adjustment
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/attendance/manual-adjustment`
4. **Purpose**: Configure totalWorkingDays in month and update employee presentDays (powers Manual Adjustment modal in AttendanceManagement.jsx).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `attendance:adjust`
7. **Request Body**:
```json
{
  "month": 10,
  "year": 2026,
  "totalWorkingDays": 24,
  "adjustments": [
    {
      "employeeId": "WB-024",
      "presentDays": 22
    }
  ],
  "reason": "Monthly reconciliation"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
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
        "presentDays": 22
      }
    ]
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Validation failed"
}
```
11. **HTTP Status Codes**: 200 OK, 400 Validation Error
12. **Important Business Rules**: Clamps presentDays between 0 and totalWorkingDays, syncs AttendanceRegister, and records an AttendanceAudit entry.

---

## 43. Export Attendance CSV

1. **API Name**: Export Attendance CSV
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/attendance/export/csv`
4. **Purpose**: Export daily attendance records as CSV (Export Attendance button in AttendanceManagement.jsx).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `attendance:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `date`, `format`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Attendance CSV exported successfully",
  "data": {
    "date": "2026-10-22",
    "fileName": "Attendance_2026-10-22.csv",
    "totalRecords": 1,
    "csv": "Employee ID,Name,Department..."
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Exports check-in, check-out, duration, status, and approval status.

---

## 44. Trigger Auto-Mark Absent Job

1. **API Name**: Trigger Auto-Mark Absent Job
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/attendance/auto-absent/run`
4. **Purpose**: Run end-of-day job to mark active employees without check-in as Absent (when autoMarkAbsent is enabled in Settings).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `attendance:adjust`
7. **Request Body**:
```json
{
  "date": "2026-10-22"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Auto-mark absent job executed",
  "data": {
    "skipped": false,
    "date": "2026-10-22",
    "markedCount": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Skips weekly offs and paid holidays; marks employees on approved leave as 'On Leave'.

---

## 45. List Monthly Payroll & Summary Cards

1. **API Name**: List Monthly Payroll & Summary Cards
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/payroll`
4. **Purpose**: Supply data for /admin/salary-management (Monthly Payroll, Pending Payments, Paid This Month cards, filters, and employee payroll rows).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payroll:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `month`, `year`, `department`, `paymentStatus`, `workflowStatus`, `search`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Payroll records fetched successfully",
  "data": {
    "month": 10,
    "year": 2026,
    "payPeriodLabel": "October 2026",
    "summaryCards": {
      "monthlyPayroll": 47000,
      "pendingPaymentsAmount": 0,
      "paidThisMonthAmount": 47000
    },
    "rows": []
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Returns both summary card totals and detailed payroll rows.

---

## 46. Run / Calculate Monthly Draft Payroll

1. **API Name**: Run / Calculate Monthly Draft Payroll
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/payroll/run`
4. **Purpose**: Calculate or recalculate monthly draft payroll from SalaryStructure, approved AttendanceRegister entries, approved Leaves, and Holidays.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payroll:run`
7. **Request Body**:
```json
{
  "month": 10,
  "year": 2026,
  "employeeIds": [
    "WB-024"
  ]
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
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
    "payrolls": []
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Validation failed"
}
```
11. **HTTP Status Codes**: 200 OK, 400 Validation Error
12. **Important Business Rules**: Uses ONLY approved attendance and approved leaves. Skips already Finalized (immutable) payrolls to prevent overwriting.

---

## 47. Get Single Payroll Details

1. **API Name**: Get Single Payroll Details
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/payroll/:id`
4. **Purpose**: View complete breakdown of a single payroll record and its associated payslip.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payroll:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Payroll details fetched successfully",
  "data": {
    "payroll": {},
    "payslip": {}
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Payroll record not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Returns attendanceBreakdown, earnings, deductions, adjustmentsList, workflowStatus, paymentStatus, and immutableSnapshot.

---

## 48. Add Payroll Adjustment (Bonus, Incentive, Deduction)

1. **API Name**: Add Payroll Adjustment (Bonus, Incentive, Deduction)
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/payroll/:id/adjustments`
4. **Purpose**: Add a Bonus, Incentive, Allowance, or Deduction to a Draft/Approved payroll and recalculate netPayable.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payroll:run`
7. **Request Body**:
```json
{
  "type": "Bonus",
  "label": "Diwali Performance Bonus",
  "amount": 2000,
  "reason": "Festive bonus"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Payroll adjustment applied and recalculated successfully",
  "data": {
    "employeeId": "WB-024",
    "netAdjustment": 2000,
    "netPayable": 47000
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Cannot modify a Finalized payroll directly. Use the reversal workflow to make post-finalization adjustments."
}
```
11. **HTTP Status Codes**: 200 OK, 400 Blocked if Finalized, 404 Not Found
12. **Important Business Rules**: Blocked with 400 if payroll is already Finalized and immutable.

---

## 49. Approve Payroll Record

1. **API Name**: Approve Payroll Record
2. **HTTP Method**: `PATCH`
3. **Complete Endpoint**: `/api/v1/admin/payroll/:id/approve`
4. **Purpose**: Mark a reviewed payroll record as Approved.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payroll:approve`
7. **Request Body**:
```json
{}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Payroll approved successfully. Payment status remains Pending until disbursement is recorded.",
  "data": {
    "workflowStatus": "Approved",
    "paymentStatus": "Pending"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Payroll record not found"
}
```
11. **HTTP Status Codes**: 200 OK, 400 Bad Request, 404 Not Found
12. **Important Business Rules**: CRITICAL: Payroll approval updates workflowStatus to 'Approved' but NEVER automatically marks paymentStatus as 'Paid'.

---

## 50. Finalize Payroll, Generate PDF Payslip & Send via SMTP

1. **API Name**: Finalize Payroll, Generate PDF Payslip & Send via SMTP
2. **HTTP Method**: `PATCH`
3. **Complete Endpoint**: `/api/v1/admin/payroll/:id/finalize`
4. **Purpose**: Finalize payroll, lock an immutable snapshot, generate an employee-specific PDF salary slip, and email it via SMTP.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payroll:finalize`
7. **Request Body**:
```json
{
  "sendEmail": true
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Payroll finalized and official PDF salary slip generated",
  "data": {
    "payroll": {
      "workflowStatus": "Finalized",
      "isImmutable": true
    },
    "payslip": {
      "payslipNumber": "PS-202610-WB-024"
    },
    "emailDelivery": {
      "sent": false,
      "status": "Pending"
    }
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Payroll record not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Saves PDF securely outside public static URLs, creates Payslip record, and logs SMTP attempt in EmailLog.

---

## 51. Update Payroll Payment Status & Reference

1. **API Name**: Update Payroll Payment Status & Reference
2. **HTTP Method**: `PATCH`
3. **Complete Endpoint**: `/api/v1/admin/payroll/:id/payment-status`
4. **Purpose**: Record actual salary disbursement status (Pending, Processing, Paid, Failed) and bank transfer reference.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payroll:finalize`
7. **Request Body**:
```json
{
  "paymentStatus": "Paid",
  "paymentMethod": "NEFT/RTGS",
  "paymentReference": "HDFC20261022998877"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Payroll payment status updated to Paid",
  "data": {
    "paymentStatus": "Paid",
    "paymentMethod": "NEFT/RTGS",
    "paymentReference": "HDFC20261022998877"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Payroll must be Approved or Finalized before marking payment status as Paid"
}
```
11. **HTTP Status Codes**: 200 OK, 400 Bad Request, 404 Not Found
12. **Important Business Rules**: Requires payroll workflowStatus to be Approved or Finalized before marking paymentStatus as Paid.

---

## 52. Reverse Finalized Payroll (Audited Reversal Workflow)

1. **API Name**: Reverse Finalized Payroll (Audited Reversal Workflow)
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/payroll/:id/reverse`
4. **Purpose**: Unlock a finalized unpaid payroll record using a mandatory audit reason so corrections can be made.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payroll:finalize`
7. **Request Body**:
```json
{
  "reason": "Correction required for additional approved overtime"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Finalized payroll reversed for adjustment",
  "data": {
    "workflowStatus": "Reversed",
    "isImmutable": false
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Cannot reverse a payroll whose payment has already been disbursed (Paid)."
}
```
11. **HTTP Status Codes**: 200 OK, 400 Bad Request, 404 Not Found
12. **Important Business Rules**: Cannot reverse a payroll whose payment has already been disbursed (Paid).

---

## 53. Bulk Update Salary Structures

1. **API Name**: Bulk Update Salary Structures
2. **HTTP Method**: `PUT`
3. **Complete Endpoint**: `/api/v1/admin/payroll/salary-structures/bulk`
4. **Purpose**: Update base salaries and component rules for multiple employees (powers Edit Salary Structure modal in SalaryManagement.jsx).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payroll:run`
7. **Request Body**:
```json
{
  "salaries": [
    {
      "employeeId": "WB-024",
      "baseSalary": 45000
    },
    {
      "employeeId": "WB-019",
      "baseSalary": 40000
    }
  ]
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "All salary structures updated successfully",
  "data": []
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Validation failed"
}
```
11. **HTTP Status Codes**: 200 OK, 400 Validation Error
12. **Important Business Rules**: Updates both Employee.baseSalary and SalaryStructure documents.

---

## 54. Export Payroll CSV

1. **API Name**: Export Payroll CSV
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/payroll/export/csv`
4. **Purpose**: Export monthly payroll sheet as CSV (Export Payroll button in SalaryManagement.jsx).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payroll:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `month`, `year`, `format`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Payroll CSV exported successfully",
  "data": {
    "month": 10,
    "year": 2026,
    "fileName": "Payroll_2026_10.csv",
    "totalRecords": 1,
    "csv": "Employee ID,Name,Department..."
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Includes Employee ID, Name, Payable Days, Base Salary, Adjustments, Net Pay, Workflow Status, and Payment Status.

---

## 55. List Generated Payslips

1. **API Name**: List Generated Payslips
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/payroll/payslips`
4. **Purpose**: List all generated employee salary slips with SMTP delivery status.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payslips:manage`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `month`, `year`, `employeeId`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Payslips fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Never exposes internal filesystem path in JSON responses.

---

## 56. Download Payslip PDF (Admin)

1. **API Name**: Download Payslip PDF (Admin)
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/payroll/payslips/:id/download`
4. **Purpose**: Securely stream an employee's PDF salary slip to an authorized admin.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payslips:manage`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "_binaryPdf": true,
  "contentType": "application/pdf"
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Payslip not found"
}
```
11. **HTTP Status Codes**: 200 OK (application/pdf), 404 Not Found
12. **Important Business Rules**: Protected by JWT + RBAC; payslips are never served via public static URLs.

---

## 57. Resend Payslip Email via SMTP

1. **API Name**: Resend Payslip Email via SMTP
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/payroll/payslips/:id/resend-email`
4. **Purpose**: Resend a generated PDF salary slip to the employee's registered email address.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payslips:manage`
7. **Request Body**:
```json
{}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "SMTP credentials are not configured in environment variables. Email preserved in Pending state.",
  "data": {
    "payslip": {
      "payslipNumber": "PS-202610-WB-024",
      "emailDeliveryStatus": "Pending"
    },
    "emailDelivery": {
      "sent": false,
      "status": "Pending"
    }
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Payslip not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Logs delivery attempt in EmailLog. If SMTP is unconfigured, preserves Pending state and returns configuration warning without crashing.

---

## 58. Get SMTP Email Delivery Logs

1. **API Name**: Get SMTP Email Delivery Logs
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/payroll/email-logs`
4. **Purpose**: Inspect email delivery attempts, retry counts, statuses, and SMTP error messages.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `payslips:manage`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `status`, `templateName`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Email delivery logs fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Tracks PAYSLIP_DELIVERY and PASSWORD_RESET emails.

---

## 59. Assign Task / Save Task Draft

1. **API Name**: Assign Task / Save Task Draft
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/tasks`
4. **Purpose**: Assign a task or save a draft task to an employee (/admin/assign-task).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `tasks:write`
7. **Request Body**:
```json
{
  "title": "Landing page responsive UI",
  "project": "Website Redesign",
  "assignees": "Rahul Sharma",
  "priority": "High",
  "startDate": "2026-10-20",
  "dueDate": "2026-10-25T18:00",
  "notifyEmployee": true,
  "repeatTask": "No repeat",
  "checklist": "Hero section, Features grid, Footer",
  "isDraft": false
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Task assigned successfully",
  "data": {
    "title": "Landing page responsive UI",
    "project": "Website Redesign",
    "assigneeName": "Rahul Sharma",
    "assigneeEmployeeId": "WB-024",
    "priority": "High",
    "status": "Assigned"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Validation failed"
}
```
11. **HTTP Status Codes**: 201 Created, 400 Validation Error, 404 Assignee Not Found
12. **Important Business Rules**: Resolves assignee by name, employeeId, or ObjectId. Creates an Employee Notification when notifyEmployee is true.

---

## 60. List All Tasks & Task Directory Stats

1. **API Name**: List All Tasks & Task Directory Stats
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/tasks`
4. **Purpose**: Fetch all tasks and top 3 stats cards (All Tasks, In Progress, Completed) for /admin/all-task.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `tasks:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `search`, `status`, `assignee`, `priority`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": {
    "stats": {
      "allTasks": 2,
      "inProgress": 0,
      "completed": 1
    },
    "tasks": []
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Supports filtering by task title, assignee name, status, and priority.

---

## 61. Get Task Details & Timeline Progress

1. **API Name**: Get Task Details & Timeline Progress
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/tasks/:id`
4. **Purpose**: Fetch task details and calculated timeline percentage for View Task modal in AllTask.jsx.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `tasks:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Task details fetched successfully",
  "data": {
    "task": {
      "title": "Landing page responsive UI"
    },
    "timeline": {
      "isCompleted": true,
      "isOverdue": false,
      "timeElapsedPercentage": 100
    }
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Task not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Calculates timeElapsedPercentage and overdue status dynamically.

---

## 62. Update Task

1. **API Name**: Update Task
2. **HTTP Method**: `PUT`
3. **Complete Endpoint**: `/api/v1/admin/tasks/:id`
4. **Purpose**: Update an assigned task (/admin/assign-task/edit/:id).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `tasks:write`
7. **Request Body**:
```json
{
  "title": "Landing page responsive UI v2",
  "priority": "Urgent",
  "status": "In Progress"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "title": "Landing page responsive UI v2",
    "status": "In Progress"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Task not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Sets completedAt timestamp automatically when status transitions to Completed/Done.

---

## 63. Delete Task

1. **API Name**: Delete Task
2. **HTTP Method**: `DELETE`
3. **Complete Endpoint**: `/api/v1/admin/tasks/:id`
4. **Purpose**: Soft-delete a task.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `tasks:write`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "isDeleted": true
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Task not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Marks isDeleted=true.

---

## 64. List Departments with Team & Task Metrics

1. **API Name**: List Departments with Team & Task Metrics
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/departments`
4. **Purpose**: Supply all department cards for /admin/departments (team size, activeTasks, completedTasks, completionRate, and team members list).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `departments:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `search`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Departments fetched successfully",
  "data": {
    "totalDepartments": 1,
    "departments": [
      {
        "name": "Development",
        "code": "DEV",
        "teamSize": 1,
        "activeTasks": 0,
        "completedTasks": 1,
        "totalTasks": 1,
        "completionRate": 100,
        "employees": []
      }
    ]
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Computes completionRate and team roster per department.

---

## 65. Create Department

1. **API Name**: Create Department
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/departments`
4. **Purpose**: Create a new company department (Add Department button in Departments.jsx).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `departments:write`
7. **Request Body**:
```json
{
  "name": "Sales",
  "code": "SALES",
  "description": "Enterprise Sales Team",
  "designations": [
    "Sales Manager",
    "Sales Exec"
  ]
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "name": "Sales",
    "code": "SALES"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "A department with this name already exists"
}
```
11. **HTTP Status Codes**: 201 Created, 400 Validation Error, 409 Conflict
12. **Important Business Rules**: Enforces unique department name and code.

---

## 66. Get Department Details & Team Members

1. **API Name**: Get Department Details & Team Members
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/departments/:id`
4. **Purpose**: View details and employees for a single department (View Details modal in Departments.jsx).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `departments:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Department details fetched successfully",
  "data": {
    "department": {
      "name": "Development"
    },
    "employees": []
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Department not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Resolves department by Mongo _id, code, or name.

---

## 67. Update Department

1. **API Name**: Update Department
2. **HTTP Method**: `PUT`
3. **Complete Endpoint**: `/api/v1/admin/departments/:id`
4. **Purpose**: Update department name, styling, or designations.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `departments:write`
7. **Request Body**:
```json
{
  "name": "Frontend Development",
  "designations": [
    "Frontend Dev",
    "Senior Frontend Dev"
  ]
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Department updated successfully",
  "data": {
    "name": "Frontend Development"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Department not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Automatically cascades department name rename to member employees.

---

## 68. Edit Employee Inside Department Modal

1. **API Name**: Edit Employee Inside Department Modal
2. **HTTP Method**: `PUT`
3. **Complete Endpoint**: `/api/v1/admin/departments/:id/employees/:empId`
4. **Purpose**: Inline-edit an employee's name, role, and email inside the Department View Details modal (Departments.jsx).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `departments:write`
7. **Request Body**:
```json
{
  "name": "Rahul Sharma",
  "role": "Lead Frontend Dev",
  "email": "rahul.sharma@company.com"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Department team member updated successfully",
  "data": {
    "department": "Development",
    "employee": {
      "id": "WB-024",
      "name": "Rahul Sharma",
      "role": "Lead Frontend Dev"
    }
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Employee not found in this department"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Updates employee record directly.

---

## 69. Remove Employee From Department

1. **API Name**: Remove Employee From Department
2. **HTTP Method**: `DELETE`
3. **Complete Endpoint**: `/api/v1/admin/departments/:id/employees/:empId`
4. **Purpose**: Remove an employee from a department (Delete button inside Department modal in Departments.jsx).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `departments:write`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Removed Rahul Sharma from Development department",
  "data": {
    "employeeId": "WB-024",
    "currentDepartment": "Unassigned"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Employee not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Reassigns employee department to 'Unassigned' without deleting the employee account.

---

## 70. Delete Department

1. **API Name**: Delete Department
2. **HTTP Method**: `DELETE`
3. **Complete Endpoint**: `/api/v1/admin/departments/:id`
4. **Purpose**: Soft-delete a department.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `departments:write`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Department deleted successfully",
  "data": {
    "isDeleted": true
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Department not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Marks department isDeleted=true.

---

## 71. Get System Settings & Attendance Policy

1. **API Name**: Get System Settings & Attendance Policy
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/settings`
4. **Purpose**: Load configuration for /admin/settings (loginTime, lateThreshold, logoutTime, autoAbsent, overtimeApproval, ipWhitelisting, emailNotifications, pushNotifications).
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `settings:manage`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Settings and attendance policy fetched successfully",
  "data": {
    "settings": {
      "loginTime": "09:00",
      "lateThreshold": "09:30",
      "logoutTime": "18:00",
      "autoAbsent": true,
      "overtimeApproval": true,
      "emailNotifications": true,
      "pushNotifications": false,
      "ipWhitelisting": false
    }
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Returns active AttendancePolicy formatted for Settings.jsx state.

---

## 72. Update System Settings & Attendance Policy

1. **API Name**: Update System Settings & Attendance Policy
2. **HTTP Method**: `PUT`
3. **Complete Endpoint**: `/api/v1/admin/settings`
4. **Purpose**: Save attendance timings and advanced feature toggles from /admin/settings.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `settings:manage`
7. **Request Body**:
```json
{
  "loginTime": "09:00",
  "lateThreshold": "09:30",
  "logoutTime": "18:00",
  "autoAbsent": true,
  "overtimeApproval": true,
  "emailNotifications": true,
  "pushNotifications": false,
  "ipWhitelisting": false
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Settings saved successfully",
  "data": {
    "settings": {
      "loginTime": "09:00",
      "lateThreshold": "09:30",
      "logoutTime": "18:00"
    }
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Automatically recalculates gracePeriodMinutes from loginTime and lateThreshold.

---

## 73. List Employee Leave Requests

1. **API Name**: List Employee Leave Requests
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/leaves`
4. **Purpose**: List paid and unpaid employee leave applications.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `leaves:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `status`, `employeeId`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Leave requests fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Supports filtering by Pending, Approved, or Rejected.

---

## 74. Approve or Reject Leave Request

1. **API Name**: Approve or Reject Leave Request
2. **HTTP Method**: `PATCH`
3. **Complete Endpoint**: `/api/v1/admin/leaves/:id/review`
4. **Purpose**: Approve or reject an employee leave application and sync with AttendanceRegister for payroll.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `leaves:approve`
7. **Request Body**:
```json
{
  "status": "Approved",
  "reviewComment": "Approved paid casual leave"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Leave request approved successfully",
  "data": {
    "status": "Approved"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Leave request not found"
}
```
11. **HTTP Status Codes**: 200 OK, 400 Bad Request, 404 Not Found
12. **Important Business Rules**: Approved leaves are recorded in AttendanceRegister and factored into monthly payroll.

---

## 75. List Company Holidays

1. **API Name**: List Company Holidays
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/holidays`
4. **Purpose**: List configured paid/unpaid holidays for attendance and payroll calculations.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `Authenticated Admin`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `year`, `month`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Holidays fetched successfully",
  "data": []
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Sorted chronologically by date.

---

## 76. Create Company Holiday

1. **API Name**: Create Company Holiday
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/holidays`
4. **Purpose**: Add a holiday to the company calendar.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `holidays:manage`
7. **Request Body**:
```json
{
  "name": "Diwali",
  "date": "2026-11-08",
  "type": "Festival",
  "isPaid": true
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Holiday created successfully",
  "data": {
    "name": "Diwali",
    "date": "2026-11-08",
    "isPaid": true
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Validation failed"
}
```
11. **HTTP Status Codes**: 201 Created, 400 Validation Error, 409 Conflict
12. **Important Business Rules**: Paid holidays count toward payable days in payroll.

---

## 77. Delete Company Holiday

1. **API Name**: Delete Company Holiday
2. **HTTP Method**: `DELETE`
3. **Complete Endpoint**: `/api/v1/admin/holidays/:id`
4. **Purpose**: Remove a holiday from the calendar.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `holidays:manage`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Holiday deleted successfully",
  "data": {
    "deletedId": "6717b0000000000000000088"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Holiday not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Deletes holiday by ID.

---

## 78. List RBAC Roles & Permissions

1. **API Name**: List RBAC Roles & Permissions
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/roles`
4. **Purpose**: List all RBAC roles and the catalog of available system permissions.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `roles:manage`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Roles and permissions fetched successfully",
  "data": {
    "availablePermissions": [],
    "roles": []
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Returns availablePermissions array and roles collection.

---

## 79. Create RBAC Role

1. **API Name**: Create RBAC Role
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/admin/roles`
4. **Purpose**: Create a custom administrative role with specific permissions.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `roles:manage`
7. **Request Body**:
```json
{
  "name": "HR Manager",
  "description": "Manages employees, attendance, and leaves",
  "permissions": [
    "employees:read",
    "employees:write",
    "attendance:read",
    "attendance:approve",
    "leaves:approve"
  ]
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "name": "HR Manager",
    "slug": "hr_manager"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "A role with this name already exists"
}
```
11. **HTTP Status Codes**: 201 Created, 409 Conflict
12. **Important Business Rules**: Generates unique slug from role name.

---

## 80. Update RBAC Role

1. **API Name**: Update RBAC Role
2. **HTTP Method**: `PUT`
3. **Complete Endpoint**: `/api/v1/admin/roles/:id`
4. **Purpose**: Update permissions or description for an RBAC role.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `roles:manage`
7. **Request Body**:
```json
{
  "permissions": [
    "employees:read",
    "attendance:read"
  ]
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "name": "HR Manager"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Role not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Updates role permissions.

---

## 81. List Admin Notifications

1. **API Name**: List Admin Notifications
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/notifications`
4. **Purpose**: Fetch notifications for the Topbar bell icon.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `Authenticated Admin`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": []
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Returns latest 50 notifications.

---

## 82. Mark Admin Notification as Read

1. **API Name**: Mark Admin Notification as Read
2. **HTTP Method**: `PATCH`
3. **Complete Endpoint**: `/api/v1/admin/notifications/:id/read`
4. **Purpose**: Mark a notification as read.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `Authenticated Admin`
7. **Request Body**:
```json
{}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "isRead": true
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Notification not found"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Sets isRead=true and readAt timestamp.

---

## 83. Get System Security & Action Audit Logs

1. **API Name**: Get System Security & Action Audit Logs
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/admin/audit-logs`
4. **Purpose**: Fetch paginated security and administrative audit trail.
5. **Required Authentication**: Bearer Token (Admin)
6. **Required Role / Permission**: `audit:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `module`, `actorType`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "System audit logs fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Records actor, module, action, targetId, IP, and User-Agent.

---

## 84. Employee Login

1. **API Name**: Employee Login
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/employee/auth/login`
4. **Purpose**: Authenticate an employee account (/login), issue JWT tokens, and record LoginHistory in UTC & Asia/Kolkata.
5. **Required Authentication**: Public (Rate-limited)
6. **Required Role / Permission**: `Active Employee`
7. **Request Body**:
```json
{
  "email": "rahul.sharma@company.com",
  "password": "EmployeePass123!",
  "rememberMe": false
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee logged in successfully",
  "data": {
    "employee": {
      "employeeId": "WB-024",
      "fullName": "Rahul Sharma",
      "email": "rahul.sharma@company.com",
      "department": "Development",
      "role": "Frontend Dev"
    },
    "accessToken": "<REDACTED_JWT_TOKEN>",
    "refreshToken": "<REDACTED_JWT_TOKEN>",
    "sessionId": "emp-session-uuid"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Invalid Credentials. Please check your email and password."
}
```
11. **HTTP Status Codes**: 200 OK, 400 Validation Error, 401 Invalid Credentials, 403 Inactive, 423 Locked
12. **Important Business Rules**: Records LoginHistory (date, time, UTC timestamp, IP, browser/OS, sessionId). NEVER automatically marks or approves attendance.

---

## 85. Rotate Employee Refresh Token

1. **API Name**: Rotate Employee Refresh Token
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/employee/auth/refresh`
4. **Purpose**: Rotate employee refresh token and obtain a new token pair.
5. **Required Authentication**: Refresh Token
6. **Required Role / Permission**: `Employee`
7. **Request Body**:
```json
{
  "refreshToken": "{{employeeRefreshToken}}"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee token refreshed successfully",
  "data": {
    "accessToken": "<REDACTED_JWT_TOKEN>",
    "refreshToken": "<REDACTED_JWT_TOKEN>"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```
11. **HTTP Status Codes**: 200 OK, 401 Unauthorized
12. **Important Business Rules**: Enforces single-use rotation and revokes session on replay attempt.

---

## 86. Employee Logout

1. **API Name**: Employee Logout
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/employee/auth/logout`
4. **Purpose**: Log out employee session and record logout timestamp & session duration in LoginHistory.
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `Authenticated Employee`
7. **Request Body**:
```json
{}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee logged out successfully",
  "data": {
    "loggedOutAt": "2026-10-22T16:35:00.000Z",
    "logoutTimeIST": "10:05 PM"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK, 401 Unauthorized
12. **Important Business Rules**: Updates LoginHistory.logoutTimestampUTC, logoutTime (Asia/Kolkata), and sessionDurationMinutes.

---

## 87. Get Employee Dashboard Overview

1. **API Name**: Get Employee Dashboard Overview
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/employee/dashboard`
4. **Purpose**: Supply data for Employee /dashboard and UserSidebar Quick Stats (Assigned Tasks, Completed This Week, In Progress, Hours Logged Today, Priority Tasks, Today's Attendance card).
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `Authenticated Employee (Self-only)`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee dashboard fetched successfully",
  "data": {
    "statsCards": {
      "assignedTasks": 0,
      "completedThisWeek": 1,
      "inProgress": 0,
      "hoursLoggedToday": "9h 00m"
    },
    "priorityTasks": [],
    "todaysAttendance": {
      "isClockedIn": false,
      "clockInTime": "09:00 AM",
      "workedSoFar": "9h 00m",
      "status": "Present",
      "approvalStatus": "Approved"
    }
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK, 401 Unauthorized
12. **Important Business Rules**: Strictly scoped to req.employee._id.

---

## 88. Get Employee Attendance Dashboard & History

1. **API Name**: Get Employee Attendance Dashboard & History
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/employee/attendance`
4. **Purpose**: Supply data for Employee /attendance page (Today's Work Time, This Week, Attendance Today cards, Current Session bar, and Attendance History table).
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `Authenticated Employee (Self-only)`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `month`, `year`, `approvalStatus`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee attendance history and dashboard fetched successfully",
  "data": {
    "topCards": {
      "todaysWorkTime": "9h 00m",
      "thisWeekWorkTime": "9h 00m",
      "attendanceTodayStatus": "Present"
    },
    "currentSession": {
      "isClockedIn": false
    },
    "history": []
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Returns only the authenticated employee's attendance records.

---

## 89. Employee Self Check-In

1. **API Name**: Employee Self Check-In
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/employee/attendance/check-in`
4. **Purpose**: Mark daily attendance check-in using server-generated timestamp.
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `self:attendance:mark`
7. **Request Body**:
```json
{
  "notes": "Starting daily sprint work"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Checked in successfully. Attendance record is pending admin approval.",
  "data": {
    "employeeId": "WB-024",
    "attendanceDate": "2026-10-22",
    "attendanceStatus": "Working",
    "approvalStatus": "Pending"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Attendance already marked for today (2026-10-22). Duplicate check-in is not allowed."
}
```
11. **HTTP Status Codes**: 201 Created, 403 IP Restricted, 409 Duplicate Check-In
12. **Important Business Rules**: Creates a 'Pending' attendance record requiring Admin approval before entering the official AttendanceRegister. Prevents duplicate check-in on the same date.

---

## 90. Employee Self Check-Out

1. **API Name**: Employee Self Check-Out
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/employee/attendance/check-out`
4. **Purpose**: Mark daily attendance check-out using server-generated timestamp and compute working duration, half-day, early checkout, and overtime.
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `self:attendance:mark`
7. **Request Body**:
```json
{}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Checked out successfully. Working duration recorded.",
  "data": {
    "employeeId": "WB-024",
    "attendanceDate": "2026-10-22",
    "durationDisplay": "8h 45m",
    "approvalStatus": "Pending"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "No active check-in found for today. Please check in first."
}
```
11. **HTTP Status Codes**: 200 OK, 400 No Active Check-In, 409 Already Checked Out
12. **Important Business Rules**: Calculates working duration against configured AttendancePolicy and keeps approvalStatus as 'Pending' for admin review.

---

## 91. Request Attendance Correction

1. **API Name**: Request Attendance Correction
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/employee/attendance/:id/correction-request`
4. **Purpose**: Submit an audited attendance correction request while preserving original check-in/check-out timestamps.
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `self:attendance:mark`
7. **Request Body**:
```json
{
  "requestedCheckInTime": "2026-10-22T03:30:00.000Z",
  "requestedCheckOutTime": "2026-10-22T12:30:00.000Z",
  "reason": "Forgot to check in at 9 AM sharp"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Attendance correction request submitted for admin approval",
  "data": {
    "approvalStatus": "Correction Requested"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Validation failed"
}
```
11. **HTTP Status Codes**: 200 OK, 400 Validation Error, 404 Not Found
12. **Important Business Rules**: Preserves originalCheckInTime and originalCheckOutTime alongside requested values and sets approvalStatus to 'Correction Requested'.

---

## 92. Get My Tasks (All / Assigned by Admin / Personal)

1. **API Name**: Get My Tasks (All / Assigned by Admin / Personal)
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/employee/tasks`
4. **Purpose**: Supply tasks and tab counts for Employee /all-task page (MyTasks.jsx).
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `self:tasks:manage`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: `page`, `limit`, `tab`, `taskType`, `status`, `priority`, `search`
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee tasks fetched successfully",
  "data": {
    "tabs": {
      "allTasks": 2,
      "assignedByAdmin": 1,
      "myTasks": 1
    },
    "tasks": []
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Returns only tasks assigned to or created by the authenticated employee.

---

## 93. Create Personal Task

1. **API Name**: Create Personal Task
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/employee/tasks`
4. **Purpose**: Create a personal task from Employee /create-task page (CreateTask.jsx).
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `self:tasks:manage`
7. **Request Body**:
```json
{
  "title": "Complete React 19 performance guide",
  "project": "Personal development",
  "priority": "Medium",
  "dueDate": "2026-10-28",
  "description": "Self-study notes"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Personal task created successfully",
  "data": {
    "title": "Complete React 19 performance guide",
    "taskType": "Personal",
    "status": "To Do"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Validation failed"
}
```
11. **HTTP Status Codes**: 201 Created, 400 Validation Error
12. **Important Business Rules**: Creates task with taskType='Personal' scoped to req.employee._id.

---

## 94. Update My Task Status

1. **API Name**: Update My Task Status
2. **HTTP Method**: `PATCH`
3. **Complete Endpoint**: `/api/v1/employee/tasks/:id`
4. **Purpose**: Update status of an assigned or personal task (e.g., To Do -> In Progress -> Completed).
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `self:tasks:manage`
7. **Request Body**:
```json
{
  "status": "Completed"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "status": "Completed"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Task not found or does not belong to you"
}
```
11. **HTTP Status Codes**: 200 OK, 404 Not Found
12. **Important Business Rules**: Employees can only update tasks where assignee matches their own _id.

---

## 95. Get Employee Work Reports & My Profile

1. **API Name**: Get Employee Work Reports & My Profile
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/employee/reports-profile`
4. **Purpose**: Supply data for Employee /reports page (WorkReports.jsx: Weekly Productivity chart, My Profile card, and Recently Completed tasks).
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `self:profile:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Employee work reports and profile fetched successfully",
  "data": {
    "profile": {
      "employeeId": "WB-024",
      "fullName": "Rahul Sharma",
      "email": "rahul.sharma@company.com",
      "department": "Development"
    },
    "weeklyProductivity": [],
    "recentlyCompleted": []
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Strictly isolated to the authenticated employee.

---

## 96. Update My Profile

1. **API Name**: Update My Profile
2. **HTTP Method**: `PUT`
3. **Complete Endpoint**: `/api/v1/employee/profile`
4. **Purpose**: Allow employee to edit their profile name, phone, or password (Edit Profile button on WorkReports.jsx).
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `self:profile:update`
7. **Request Body**:
```json
{
  "fullName": "Rahul Sharma",
  "phone": "+91-9876543210"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "employeeId": "WB-024",
    "fullName": "Rahul Sharma"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```
11. **HTTP Status Codes**: 200 OK, 400 Bad Request
12. **Important Business Rules**: Employees cannot alter their own salary, role, department, or employeeId.

---

## 97. Apply for Leave

1. **API Name**: Apply for Leave
2. **HTTP Method**: `POST`
3. **Complete Endpoint**: `/api/v1/employee/leaves`
4. **Purpose**: Submit a leave request.
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `Authenticated Employee`
7. **Request Body**:
```json
{
  "leaveType": "Casual Leave",
  "startDate": "2026-10-26",
  "endDate": "2026-10-27",
  "isHalfDay": false,
  "reason": "Family function"
}
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Leave application submitted successfully",
  "data": {
    "leaveType": "Casual Leave",
    "totalDays": 2,
    "status": "Pending"
  }
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Validation failed"
}
```
11. **HTTP Status Codes**: 201 Created, 400 Validation Error
12. **Important Business Rules**: Creates leave in 'Pending' status awaiting admin approval.

---

## 98. List My Leaves

1. **API Name**: List My Leaves
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/employee/leaves`
4. **Purpose**: View authenticated employee's own leave applications.
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `Authenticated Employee`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "My leave requests fetched successfully",
  "data": []
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Scoped strictly to req.employee._id.

---

## 99. List My Payslips

1. **API Name**: List My Payslips
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/employee/payslips`
4. **Purpose**: View authenticated employee's own finalized salary slips.
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `self:payslips:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "My payslips fetched successfully",
  "data": []
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Scoped strictly to req.employee._id.

---

## 100. Download My Payslip PDF

1. **API Name**: Download My Payslip PDF
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/employee/payslips/:id/download`
4. **Purpose**: Download authenticated employee's own PDF salary slip.
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `self:payslips:read`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "_binaryPdf": true,
  "contentType": "application/pdf"
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Forbidden: You are not authorized to download another employee's salary slip"
}
```
11. **HTTP Status Codes**: 200 OK (application/pdf), 403 Forbidden (if another employee's payslip), 404 Not Found
12. **Important Business Rules**: Enforces strict employee ownership check: returns 403 Forbidden if an employee tries to download another employee's payslip.

---

## 101. List My Notifications

1. **API Name**: List My Notifications
2. **HTTP Method**: `GET`
3. **Complete Endpoint**: `/api/v1/employee/notifications`
4. **Purpose**: Fetch notifications for the Employee Topbar bell icon.
5. **Required Authentication**: Bearer Token (Employee)
6. **Required Role / Permission**: `Authenticated Employee`
7. **Request Body**:
```json
null
```
8. **Query Parameters**: None
9. **Example Success Response**:
```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": []
}
```
10. **Example Error Response**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```
11. **HTTP Status Codes**: 200 OK
12. **Important Business Rules**: Scoped to employee's own notifications and company-wide employee announcements.

---

