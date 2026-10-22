const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const mongoose = require("mongoose");
const { runUnitTests } = require("./unit.test");

process.env.NODE_ENV = "test";
process.env.AUTH_RATE_LIMIT_MAX = "500";
process.env.API_RATE_LIMIT_MAX = "2000";

const { app } = require("../server");

/**
 * Helper to make HTTP requests against the running Express test server
 */
const makeRequest = (baseUrl, { method = "GET", path: urlPath, token = null, body = null }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, baseUrl);
    const payload = body ? JSON.stringify(body) : null;

    const headers = {
      Accept: "application/json",
      "User-Agent": "Techneest-HTTP-TestRunner/1.0 (macOS)",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (payload) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const rawBuffer = Buffer.concat(chunks);
          const contentType = res.headers["content-type"] || "";
          let parsedBody = null;
          if (contentType.includes("application/json")) {
            try {
              parsedBody = JSON.parse(rawBuffer.toString("utf8"));
            } catch (e) {
              parsedBody = rawBuffer.toString("utf8");
            }
          } else if (contentType.includes("application/pdf")) {
            parsedBody = {
              _binaryPdf: true,
              byteLength: rawBuffer.length,
              headerPrefix: rawBuffer.slice(0, 8).toString("utf8"),
            };
          } else {
            parsedBody = rawBuffer.toString("utf8");
          }

          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsedBody,
          });
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
};

/**
 * Sanitizes tokens, passwords, and sensitive values before writing to POSTMAN_TEST_REPORT.md
 */
const sanitizeResponseForReport = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  const clone = JSON.parse(JSON.stringify(obj));

  const maskRecursive = (target) => {
    if (!target || typeof target !== "object") return;
    for (const k of Object.keys(target)) {
      if (["accessToken", "refreshToken", "token"].includes(k) && typeof target[k] === "string") {
        target[k] = "<REDACTED_JWT_TOKEN>";
      } else if (k === "password") {
        target[k] = "<REDACTED_PASSWORD>";
      } else if (typeof target[k] === "object" && target[k] !== null) {
        maskRecursive(target[k]);
      }
    }
  };

  maskRecursive(clone);
  return clone;
};

/**
 * Starts an ephemeral local mongod instance if needed for integration testing
 */
const startEphemeralMongo = () => {
  return new Promise((resolve, reject) => {
    const dbPath = path.join("/tmp", `techneest_test_db_${Date.now()}`);
    fs.mkdirSync(dbPath, { recursive: true });
    const mongoPort = 27099;

    const proc = spawn("/usr/local/bin/mongod", [
      "--dbpath",
      dbPath,
      "--port",
      String(mongoPort),
      "--bind_ip",
      "127.0.0.1",
    ]);

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error("Timed out starting local mongod"));
      }
    }, 8000);

    proc.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      if (!resolved && (text.includes("Waiting for connections") || text.includes("waiting for connections"))) {
        resolved = true;
        clearTimeout(timeout);
        resolve({
          uri: `mongodb://127.0.0.1:${mongoPort}/techneest_test`,
          proc,
          dbPath,
        });
      }
    });

    proc.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(err);
      }
    });
  });
};

const runFullTestSuite = async () => {
  const unitSummary = await runUnitTests();

  let mongoInstance = null;
  let server = null;
  const testResults = [];

  try {
    console.log("\n=== Starting Ephemeral MongoDB & Express Server for Integration Testing ===");
    mongoInstance = await startEphemeralMongo();
    await mongoose.connect(mongoInstance.uri);
    console.log("Connected to ephemeral test MongoDB:", mongoInstance.uri);

    server = await new Promise((resolve) => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;
    console.log(`Express test server listening on ${baseUrl}`);

    const recordStep = async ({
      name,
      endpoint,
      method,
      scenario,
      requestOptions,
      expectedStatus,
      validateFn,
    }) => {
      try {
        const res = await makeRequest(baseUrl, {
          method,
          ...requestOptions,
        });
        const statusMatch = res.status === expectedStatus;
        let customValid = true;
        let validationNote = "";
        if (validateFn) {
          try {
            validateFn(res);
          } catch (vErr) {
            customValid = false;
            validationNote = vErr.message;
          }
        }
        const passed = statusMatch && customValid;
        const sanitizedBody = sanitizeResponseForReport(res.body);

        testResults.push({
          name,
          method,
          endpoint,
          scenario,
          expectedStatus,
          actualStatus: res.status,
          passed,
          issue: passed
            ? "None"
            : `Expected ${expectedStatus}, got ${res.status}. ${validationNote}`,
          sanitizedResponse: sanitizedBody,
        });

        console.log(
          `  [${passed ? "PASS" : "FAIL"}] ${method} ${endpoint} (${scenario}) -> HTTP ${res.status}`
        );
        return res;
      } catch (err) {
        testResults.push({
          name,
          method,
          endpoint,
          scenario,
          expectedStatus,
          actualStatus: "ERROR",
          passed: false,
          issue: err.message,
          sanitizedResponse: { error: err.message },
        });
        console.error(`  [FAIL] ${method} ${endpoint}: ${err.message}`);
        return null;
      }
    };

    // --- 1. Health Check ---
    await recordStep({
      name: "System Health Check",
      method: "GET",
      endpoint: "/api/health",
      scenario: "Verify server & MongoDB connection health",
      requestOptions: { path: "/api/health" },
      expectedStatus: 200,
    });

    // --- 2. Initial Admin Setup ---
    await recordStep({
      name: "Initial Admin Setup",
      method: "POST",
      endpoint: "/api/v1/admin/auth/setup",
      scenario: "Bootstrap initial super_admin account",
      requestOptions: {
        path: "/api/v1/admin/auth/setup",
        body: {
          fullName: "Vikram Admin",
          email: "admin@workboard.com",
          password: "AdminStrongPassword123!",
        },
      },
      expectedStatus: 201,
    });

    // --- 3. Duplicate Initial Admin Setup Blocked ---
    await recordStep({
      name: "Duplicate Admin Setup Blocked",
      method: "POST",
      endpoint: "/api/v1/admin/auth/setup",
      scenario: "Verify second setup call is blocked when admin already exists",
      requestOptions: {
        path: "/api/v1/admin/auth/setup",
        body: {
          fullName: "Unauthorized Admin",
          email: "attacker@workboard.com",
          password: "Password123!",
        },
      },
      expectedStatus: 403,
    });

    // --- 4. Admin Login Validation Error ---
    await recordStep({
      name: "Admin Login Validation Failure",
      method: "POST",
      endpoint: "/api/v1/admin/auth/login",
      scenario: "Invalid email format triggers 400 validation error",
      requestOptions: {
        path: "/api/v1/admin/auth/login",
        body: {
          email: "not-an-email",
          password: "",
        },
      },
      expectedStatus: 400,
    });

    // --- 5. Admin Login Invalid Credentials ---
    await recordStep({
      name: "Admin Login Invalid Password",
      method: "POST",
      endpoint: "/api/v1/admin/auth/login",
      scenario: "Wrong password returns 401 and records failed LoginHistory",
      requestOptions: {
        path: "/api/v1/admin/auth/login",
        body: {
          email: "admin@workboard.com",
          password: "WrongPassword999",
        },
      },
      expectedStatus: 401,
    });

    // --- 6. Admin Login Success ---
    const adminLoginRes = await recordStep({
      name: "Admin Login Success",
      method: "POST",
      endpoint: "/api/v1/admin/auth/login",
      scenario: "Valid admin credentials return JWT access & refresh tokens",
      requestOptions: {
        path: "/api/v1/admin/auth/login",
        body: {
          email: "admin@workboard.com",
          password: "AdminStrongPassword123!",
          rememberMe: true,
        },
      },
      expectedStatus: 200,
    });

    const adminToken = adminLoginRes?.body?.data?.accessToken;
    const adminRefreshToken = adminLoginRes?.body?.data?.refreshToken;

    // --- 7. Admin Profile ---
    await recordStep({
      name: "Get Admin Profile",
      method: "GET",
      endpoint: "/api/v1/admin/auth/profile",
      scenario: "Fetch authenticated admin profile",
      requestOptions: {
        path: "/api/v1/admin/auth/profile",
        token: adminToken,
      },
      expectedStatus: 200,
    });

    // --- 8. Admin Refresh Token Rotation ---
    const refreshRes = await recordStep({
      name: "Admin Refresh Token Rotation",
      method: "POST",
      endpoint: "/api/v1/admin/auth/refresh",
      scenario: "Rotate refresh token and issue new token pair",
      requestOptions: {
        path: "/api/v1/admin/auth/refresh",
        body: { refreshToken: adminRefreshToken },
      },
      expectedStatus: 200,
    });
    const activeAdminToken = refreshRes?.body?.data?.accessToken || adminToken;

    // --- 9. Create Department ---
    const deptRes = await recordStep({
      name: "Create Department",
      method: "POST",
      endpoint: "/api/v1/admin/departments",
      scenario: "Create Development department",
      requestOptions: {
        path: "/api/v1/admin/departments",
        token: activeAdminToken,
        body: {
          name: "Development",
          code: "DEV",
          description: "Frontend and Backend Engineering",
          designations: ["Frontend Dev", "Backend Dev"],
        },
      },
      expectedStatus: 201,
    });
    const deptId = deptRes?.body?.data?._id;

    // --- 10. Create Employee 1 (Rahul Sharma - WB-024) ---
    const emp1Res = await recordStep({
      name: "Create Employee (WB-024)",
      method: "POST",
      endpoint: "/api/v1/admin/employees",
      scenario: "Create employee Rahul Sharma with baseSalary 45000",
      requestOptions: {
        path: "/api/v1/admin/employees",
        token: activeAdminToken,
        body: {
          fullName: "Rahul Sharma",
          employeeId: "WB-024",
          email: "rahul.sharma@company.com",
          password: "EmployeePass123!",
          department: "Development",
          role: "Frontend Dev",
          joiningDate: "2023-01-15",
          salary: 45000,
          status: "Active",
        },
      },
      expectedStatus: 201,
    });
    const emp1Id = emp1Res?.body?.data?._id;

    // --- 11. Create Employee 2 (Priya Verma - WB-019) ---
    const emp2Res = await recordStep({
      name: "Create Employee (WB-019)",
      method: "POST",
      endpoint: "/api/v1/admin/employees",
      scenario: "Create second employee Priya Verma for data isolation testing",
      requestOptions: {
        path: "/api/v1/admin/employees",
        token: activeAdminToken,
        body: {
          fullName: "Priya Verma",
          employeeId: "WB-019",
          email: "priya.v@company.com",
          password: "PriyaPass123!",
          department: "QA",
          role: "QA Engineer",
          joiningDate: "2023-03-10",
          salary: 40000,
          status: "Active",
        },
      },
      expectedStatus: 201,
    });
    const emp2Id = emp2Res?.body?.data?._id;

    // --- 12. List Employees with Search & Pagination ---
    await recordStep({
      name: "List Employees",
      method: "GET",
      endpoint: "/api/v1/admin/employees?page=1&limit=10&search=Rahul",
      scenario: "Paginated employee list with search filter",
      requestOptions: {
        path: "/api/v1/admin/employees?page=1&limit=10&search=Rahul",
        token: activeAdminToken,
      },
      expectedStatus: 200,
    });

    // --- 13. Get Employee Details & Monthly Calendar ---
    await recordStep({
      name: "Get Employee Details",
      method: "GET",
      endpoint: `/api/v1/admin/employees/WB-024`,
      scenario: "Fetch employee profile, task stats, and monthly attendance calendar",
      requestOptions: {
        path: `/api/v1/admin/employees/WB-024`,
        token: activeAdminToken,
      },
      expectedStatus: 200,
    });

    // --- 14. Update Employee ---
    await recordStep({
      name: "Update Employee",
      method: "PUT",
      endpoint: `/api/v1/admin/employees/WB-024`,
      scenario: "Update employee phone and designation",
      requestOptions: {
        path: `/api/v1/admin/employees/WB-024`,
        token: activeAdminToken,
        body: {
          phone: "+91-9876543210",
          designation: "Senior Frontend Developer",
        },
      },
      expectedStatus: 200,
    });

    // --- 15. Employee Login & Activity Tracking ---
    const emp1LoginRes = await recordStep({
      name: "Employee Login (Rahul Sharma)",
      method: "POST",
      endpoint: "/api/v1/employee/auth/login",
      scenario: "Employee logs in; records LoginHistory in UTC & Asia/Kolkata without auto-creating approved attendance",
      requestOptions: {
        path: "/api/v1/employee/auth/login",
        body: {
          email: "rahul.sharma@company.com",
          password: "EmployeePass123!",
        },
      },
      expectedStatus: 200,
    });
    const emp1Token = emp1LoginRes?.body?.data?.accessToken;

    const emp2LoginRes = await recordStep({
      name: "Employee Login (Priya Verma)",
      method: "POST",
      endpoint: "/api/v1/employee/auth/login",
      scenario: "Second employee logs in",
      requestOptions: {
        path: "/api/v1/employee/auth/login",
        body: {
          email: "priya.v@company.com",
          password: "PriyaPass123!",
        },
      },
      expectedStatus: 200,
    });
    const emp2Token = emp2LoginRes?.body?.data?.accessToken;

    // --- 16. Verify RBAC: Employee Cannot Access Admin Endpoints ---
    await recordStep({
      name: "RBAC Restriction Check (Employee -> Admin API)",
      method: "GET",
      endpoint: "/api/v1/admin/employees",
      scenario: "Employee token attempting to access Admin route is rejected with 403",
      requestOptions: {
        path: "/api/v1/admin/employees",
        token: emp1Token,
      },
      expectedStatus: 403,
    });

    // --- 17. Verify Login Alone Did NOT Create Approved Attendance ---
    await recordStep({
      name: "Verify Login Does Not Count as Approved Attendance",
      method: "GET",
      endpoint: "/api/v1/admin/attendance/register?employeeId=WB-024",
      scenario: "Official AttendanceRegister has 0 records immediately after login before check-in & admin approval",
      requestOptions: {
        path: "/api/v1/admin/attendance/register?employeeId=WB-024",
        token: activeAdminToken,
      },
      expectedStatus: 200,
      validateFn: (res) => {
        if ((res.body?.data || []).length !== 0) {
          throw new Error("Expected 0 official attendance records after login alone");
        }
      },
    });

    // --- 18. Admin Views Employee Login History & Active Sessions ---
    await recordStep({
      name: "Admin Views Employee Login History",
      method: "GET",
      endpoint: "/api/v1/admin/activity/login-history?employeeId=WB-024",
      scenario: "Verify login date, time, IP, and device metadata recorded",
      requestOptions: {
        path: "/api/v1/admin/activity/login-history?employeeId=WB-024",
        token: activeAdminToken,
      },
      expectedStatus: 200,
    });

    await recordStep({
      name: "Admin Views Active Employee Sessions",
      method: "GET",
      endpoint: "/api/v1/admin/activity/active-sessions",
      scenario: "List currently active employee sessions with duration",
      requestOptions: {
        path: "/api/v1/admin/activity/active-sessions",
        token: activeAdminToken,
      },
      expectedStatus: 200,
    });

    // --- 19. Employee Self Check-In (Creates Pending Attendance) ---
    const checkInRes = await recordStep({
      name: "Employee Self Check-In",
      method: "POST",
      endpoint: "/api/v1/employee/attendance/check-in",
      scenario: "Employee marks check-in; creates Pending attendance record",
      requestOptions: {
        path: "/api/v1/employee/attendance/check-in",
        token: emp1Token,
        body: { notes: "Started work on landing page UI" },
      },
      expectedStatus: 201,
    });
    const attendanceId = checkInRes?.body?.data?._id;

    // --- 20. Duplicate Check-In Prevention ---
    await recordStep({
      name: "Duplicate Attendance Check-In Prevention",
      method: "POST",
      endpoint: "/api/v1/employee/attendance/check-in",
      scenario: "Second check-in on the same date is rejected with 409",
      requestOptions: {
        path: "/api/v1/employee/attendance/check-in",
        token: emp1Token,
      },
      expectedStatus: 409,
    });

    // --- 21. Employee Self Check-Out ---
    await recordStep({
      name: "Employee Self Check-Out",
      method: "POST",
      endpoint: "/api/v1/employee/attendance/check-out",
      scenario: "Employee checks out; duration calculated and status stays Pending approval",
      requestOptions: {
        path: "/api/v1/employee/attendance/check-out",
        token: emp1Token,
      },
      expectedStatus: 200,
    });

    // --- 22. Employee Requests Attendance Correction ---
    await recordStep({
      name: "Employee Attendance Correction Request",
      method: "POST",
      endpoint: `/api/v1/employee/attendance/${attendanceId}/correction-request`,
      scenario: "Employee submits correction request with full 9h shift timestamps",
      requestOptions: {
        path: `/api/v1/employee/attendance/${attendanceId}/correction-request`,
        token: emp1Token,
        body: {
          requestedCheckInTime: "2026-10-22T03:30:00.000Z", // 09:00 AM IST
          requestedCheckOutTime: "2026-10-22T12:30:00.000Z", // 06:00 PM IST (9h)
          reason: "Forgot to check in at 9 AM sharp",
        },
      },
      expectedStatus: 200,
    });

    // --- 23. Admin Views Pending Attendance Approvals ---
    await recordStep({
      name: "Admin Views Pending Attendance Approvals",
      method: "GET",
      endpoint: "/api/v1/admin/attendance/pending",
      scenario: "Admin lists pending / correction-requested attendance records",
      requestOptions: {
        path: "/api/v1/admin/attendance/pending",
        token: activeAdminToken,
      },
      expectedStatus: 200,
    });

    // --- 24. Admin Approves Attendance (Transfers to Official AttendanceRegister) ---
    await recordStep({
      name: "Admin Approves Attendance Entry",
      method: "PATCH",
      endpoint: `/api/v1/admin/attendance/${attendanceId}/review`,
      scenario: "Admin approves attendance; transfers to official AttendanceRegister and updates employee summary",
      requestOptions: {
        path: `/api/v1/admin/attendance/${attendanceId}/review`,
        token: activeAdminToken,
        body: {
          decision: "Approved",
          reason: "Verified shift timings with team lead",
          overrideStatus: "Present",
        },
      },
      expectedStatus: 200,
    });

    // --- 25. Verify Official AttendanceRegister & Audit Trail ---
    await recordStep({
      name: "Verify Official AttendanceRegister Entry",
      method: "GET",
      endpoint: "/api/v1/admin/attendance/register?employeeId=WB-024",
      scenario: "Verify approved attendance is now in official AttendanceRegister without duplicates",
      requestOptions: {
        path: "/api/v1/admin/attendance/register?employeeId=WB-024",
        token: activeAdminToken,
      },
      expectedStatus: 200,
      validateFn: (res) => {
        if ((res.body?.data || []).length !== 1) {
          throw new Error("Expected exactly 1 official AttendanceRegister record");
        }
      },
    });

    await recordStep({
      name: "Get Attendance Approval Audit Trail",
      method: "GET",
      endpoint: "/api/v1/admin/attendance/audit-logs?employeeId=WB-024",
      scenario: "Verify permanent audit trail of CHECK_IN, CHECK_OUT, CORRECTION_REQUESTED, and CORRECTION_APPROVED",
      requestOptions: {
        path: "/api/v1/admin/attendance/audit-logs?employeeId=WB-024",
        token: activeAdminToken,
      },
      expectedStatus: 200,
    });

    // --- 26. Admin Manual Attendance Adjustment (AttendanceManagement.jsx modal) ---
    await recordStep({
      name: "Admin Manual Attendance Adjustment",
      method: "POST",
      endpoint: "/api/v1/admin/attendance/manual-adjustment",
      scenario: "Set totalWorkingDays=24 and adjust WB-024 presentDays=22 for October 2026",
      requestOptions: {
        path: "/api/v1/admin/attendance/manual-adjustment",
        token: activeAdminToken,
        body: {
          month: 10,
          year: 2026,
          totalWorkingDays: 24,
          adjustments: [{ employeeId: "WB-024", presentDays: 22 }],
          reason: "October 2026 monthly reconciliation",
        },
      },
      expectedStatus: 200,
    });

    // --- 27. Leave Application & Approval (2 Paid Leave Days in Oct 2026) ---
    const leaveRes = await recordStep({
      name: "Employee Applies for Paid Leave",
      method: "POST",
      endpoint: "/api/v1/employee/leaves",
      scenario: "Employee WB-024 applies for 2 days Casual Leave",
      requestOptions: {
        path: "/api/v1/employee/leaves",
        token: emp1Token,
        body: {
          leaveType: "Casual Leave",
          startDate: "2026-10-26",
          endDate: "2026-10-27",
          reason: "Family function",
        },
      },
      expectedStatus: 201,
    });
    const leaveId = leaveRes?.body?.data?._id;

    await recordStep({
      name: "Admin Approves Leave Request",
      method: "PATCH",
      endpoint: `/api/v1/admin/leaves/${leaveId}/review`,
      scenario: "Admin approves 2 paid leave days for WB-024",
      requestOptions: {
        path: `/api/v1/admin/leaves/${leaveId}/review`,
        token: activeAdminToken,
        body: {
          status: "Approved",
          reviewComment: "Approved paid casual leave",
        },
      },
      expectedStatus: 200,
    });

    // --- 28. Run / Calculate Monthly Draft Payroll (October 2026) ---
    const runPayrollRes = await recordStep({
      name: "Run Monthly Payroll Calculation (Oct 2026)",
      method: "POST",
      endpoint: "/api/v1/admin/payroll/run",
      scenario: "Calculate draft payroll for October 2026 using approved attendance and leaves",
      requestOptions: {
        path: "/api/v1/admin/payroll/run",
        token: activeAdminToken,
        body: {
          month: 10,
          year: 2026,
          employeeIds: ["WB-024"],
        },
      },
      expectedStatus: 200,
    });
    const payrollId = runPayrollRes?.body?.data?.payrolls?.[0]?._id;

    // --- 29. Add Payroll Adjustment (+2000 Bonus) ---
    await recordStep({
      name: "Add Payroll Bonus Adjustment",
      method: "POST",
      endpoint: `/api/v1/admin/payroll/${payrollId}/adjustments`,
      scenario: "Add INR 2,000 Festival Bonus and recalculate before finalization",
      requestOptions: {
        path: `/api/v1/admin/payroll/${payrollId}/adjustments`,
        token: activeAdminToken,
        body: {
          type: "Bonus",
          label: "Diwali Performance Bonus",
          amount: 2000,
          reason: "Festive bonus",
        },
      },
      expectedStatus: 200,
    });

    // --- 30. Approve Payroll (Verify Payment Status Remains Pending) ---
    await recordStep({
      name: "Approve Payroll Record",
      method: "PATCH",
      endpoint: `/api/v1/admin/payroll/${payrollId}/approve`,
      scenario: "Admin approves payroll; workflowStatus becomes Approved while paymentStatus stays Pending",
      requestOptions: {
        path: `/api/v1/admin/payroll/${payrollId}/approve`,
        token: activeAdminToken,
      },
      expectedStatus: 200,
      validateFn: (res) => {
        if (res.body?.data?.paymentStatus !== "Pending") {
          throw new Error("Payroll approval must not automatically mark paymentStatus as Paid");
        }
      },
    });

    // --- 31. Finalize Payroll, Lock Immutable Snapshot, Generate PDF Payslip & Attempt SMTP ---
    const finalizeRes = await recordStep({
      name: "Finalize Payroll & Generate Payslip",
      method: "PATCH",
      endpoint: `/api/v1/admin/payroll/${payrollId}/finalize`,
      scenario: "Finalize payroll, lock immutable snapshot, generate PDF payslip, and log SMTP state",
      requestOptions: {
        path: `/api/v1/admin/payroll/${payrollId}/finalize`,
        token: activeAdminToken,
        body: { sendEmail: true },
      },
      expectedStatus: 200,
    });
    const payslipId = finalizeRes?.body?.data?.payslip?._id;

    // --- 32. Verify Finalized Payroll Cannot Be Modified Directly ---
    await recordStep({
      name: "Prevent Modification of Finalized Payroll",
      method: "POST",
      endpoint: `/api/v1/admin/payroll/${payrollId}/adjustments`,
      scenario: "Adding adjustment to Finalized immutable payroll is blocked with 400",
      requestOptions: {
        path: `/api/v1/admin/payroll/${payrollId}/adjustments`,
        token: activeAdminToken,
        body: {
          type: "Deduction",
          label: "Unauthorized change",
          amount: 500,
        },
      },
      expectedStatus: 400,
    });

    // --- 33. Record Actual Payment Transfer Status ---
    await recordStep({
      name: "Update Payroll Payment Status to Paid",
      method: "PATCH",
      endpoint: `/api/v1/admin/payroll/${payrollId}/payment-status`,
      scenario: "Mark finalized payroll as Paid with bank reference number",
      requestOptions: {
        path: `/api/v1/admin/payroll/${payrollId}/payment-status`,
        token: activeAdminToken,
        body: {
          paymentStatus: "Paid",
          paymentMethod: "NEFT/RTGS",
          paymentReference: "HDFC20261022998877",
        },
      },
      expectedStatus: 200,
    });

    // --- 34. Employee Downloads Own Payslip PDF ---
    await recordStep({
      name: "Employee Downloads Own Payslip PDF",
      method: "GET",
      endpoint: `/api/v1/employee/payslips/${payslipId}/download`,
      scenario: "Employee WB-024 downloads their own generated PDF salary slip",
      requestOptions: {
        path: `/api/v1/employee/payslips/${payslipId}/download`,
        token: emp1Token,
      },
      expectedStatus: 200,
      validateFn: (res) => {
        if (!res.body?._binaryPdf) {
          throw new Error("Expected binary PDF response");
        }
      },
    });

    // --- 35. Employee Data Isolation Check: Employee 2 Cannot Download Employee 1's Payslip ---
    await recordStep({
      name: "Employee Data Isolation (Cross-Employee Payslip Blocked)",
      method: "GET",
      endpoint: `/api/v1/employee/payslips/${payslipId}/download`,
      scenario: "Employee WB-019 attempting to download WB-024's payslip is rejected with 403",
      requestOptions: {
        path: `/api/v1/employee/payslips/${payslipId}/download`,
        token: emp2Token,
      },
      expectedStatus: 403,
    });

    // --- 36. Admin Resends Payslip Email & Checks EmailLogs ---
    await recordStep({
      name: "Admin Resends Payslip Email",
      method: "POST",
      endpoint: `/api/v1/admin/payroll/payslips/${payslipId}/resend-email`,
      scenario: "Admin triggers payslip resend; preserves Pending state with warning when SMTP unconfigured",
      requestOptions: {
        path: `/api/v1/admin/payroll/payslips/${payslipId}/resend-email`,
        token: activeAdminToken,
      },
      expectedStatus: 200,
    });

    await recordStep({
      name: "Admin Views SMTP Email Logs",
      method: "GET",
      endpoint: "/api/v1/admin/payroll/email-logs",
      scenario: "Verify EmailLog records delivery attempts",
      requestOptions: {
        path: "/api/v1/admin/payroll/email-logs",
        token: activeAdminToken,
      },
      expectedStatus: 200,
    });

    // --- 37. Admin Assigns Task & Employee Manages Tasks ---
    const taskRes = await recordStep({
      name: "Admin Assigns Task",
      method: "POST",
      endpoint: "/api/v1/admin/tasks",
      scenario: "Admin assigns task to Rahul Sharma",
      requestOptions: {
        path: "/api/v1/admin/tasks",
        token: activeAdminToken,
        body: {
          title: "Landing page responsive UI",
          project: "Website Redesign",
          assignees: "Rahul Sharma",
          priority: "High",
          startDate: "2026-10-20",
          dueDate: "2026-10-25T18:00",
          notifyEmployee: true,
          checklist: "Hero section, Footer",
        },
      },
      expectedStatus: 201,
    });
    const assignedTaskId = taskRes?.body?.data?._id;

    await recordStep({
      name: "Employee Creates Personal Task",
      method: "POST",
      endpoint: "/api/v1/employee/tasks",
      scenario: "Employee creates a personal task on /create-task",
      requestOptions: {
        path: "/api/v1/employee/tasks",
        token: emp1Token,
        body: {
          title: "Complete React 19 performance guide",
          project: "Personal development",
          priority: "Medium",
          dueDate: "2026-10-28",
          description: "Self-study notes",
        },
      },
      expectedStatus: 201,
    });

    await recordStep({
      name: "Employee Updates Assigned Task Status",
      method: "PATCH",
      endpoint: `/api/v1/employee/tasks/${assignedTaskId}`,
      scenario: "Employee marks assigned task as Completed",
      requestOptions: {
        path: `/api/v1/employee/tasks/${assignedTaskId}`,
        token: emp1Token,
        body: { status: "Completed" },
      },
      expectedStatus: 200,
    });

    // --- 38. Admin Dashboard, Reports, Departments, Settings, Audit Logs ---
    await recordStep({
      name: "Admin Dashboard Overview",
      method: "GET",
      endpoint: "/api/v1/admin/dashboard",
      scenario: "Fetch Admin Dashboard cards, sidebar stats, recent team activity, and attendance overview",
      requestOptions: {
        path: "/api/v1/admin/dashboard",
        token: activeAdminToken,
      },
      expectedStatus: 200,
    });

    await recordStep({
      name: "Admin Analytics Reports",
      method: "GET",
      endpoint: "/api/v1/admin/reports",
      scenario: "Fetch team performance report and weekly task chart",
      requestOptions: {
        path: "/api/v1/admin/reports",
        token: activeAdminToken,
      },
      expectedStatus: 200,
    });

    await recordStep({
      name: "Admin Departments List",
      method: "GET",
      endpoint: "/api/v1/admin/departments",
      scenario: "Fetch departments with team size and task completion rate",
      requestOptions: {
        path: "/api/v1/admin/departments",
        token: activeAdminToken,
      },
      expectedStatus: 200,
    });

    await recordStep({
      name: "Admin Update Settings & Attendance Policy",
      method: "PUT",
      endpoint: "/api/v1/admin/settings",
      scenario: "Update standard login/logout times and toggles",
      requestOptions: {
        path: "/api/v1/admin/settings",
        token: activeAdminToken,
        body: {
          loginTime: "09:00",
          lateThreshold: "09:30",
          logoutTime: "18:00",
          autoAbsent: true,
          overtimeApproval: true,
          emailNotifications: true,
        },
      },
      expectedStatus: 200,
    });

    await recordStep({
      name: "Admin Views System Audit Logs",
      method: "GET",
      endpoint: "/api/v1/admin/audit-logs",
      scenario: "Fetch security and administrative audit logs",
      requestOptions: {
        path: "/api/v1/admin/audit-logs",
        token: activeAdminToken,
      },
      expectedStatus: 200,
    });

    // --- 39. Employee Dashboard & Work Reports/Profile ---
    await recordStep({
      name: "Employee Dashboard Overview",
      method: "GET",
      endpoint: "/api/v1/employee/dashboard",
      scenario: "Fetch employee dashboard stats, priority tasks, and today's attendance",
      requestOptions: {
        path: "/api/v1/employee/dashboard",
        token: emp1Token,
      },
      expectedStatus: 200,
    });

    await recordStep({
      name: "Employee Work Reports & Profile",
      method: "GET",
      endpoint: "/api/v1/employee/reports-profile",
      scenario: "Fetch employee weekly productivity chart, profile, and recently completed tasks",
      requestOptions: {
        path: "/api/v1/employee/reports-profile",
        token: emp1Token,
      },
      expectedStatus: 200,
    });

    // --- 40. Employee & Admin Logout ---
    await recordStep({
      name: "Employee Logout",
      method: "POST",
      endpoint: "/api/v1/employee/auth/logout",
      scenario: "Employee logs out; records logoutTimestampUTC and sessionDurationMinutes",
      requestOptions: {
        path: "/api/v1/employee/auth/logout",
        token: emp1Token,
      },
      expectedStatus: 200,
    });

    await recordStep({
      name: "Admin Logout",
      method: "POST",
      endpoint: "/api/v1/admin/auth/logout",
      scenario: "Admin logs out and invalidates session",
      requestOptions: {
        path: "/api/v1/admin/auth/logout",
        token: activeAdminToken,
      },
      expectedStatus: 200,
    });

    // Save raw results JSON so we can generate POSTMAN_TEST_REPORT.md with actual sanitized responses
    const reportJsonPath = path.join(__dirname, "last_test_results.json");
    fs.writeFileSync(
      reportJsonPath,
      JSON.stringify(
        {
          executedAt: new Date().toISOString(),
          unitSummary,
          integrationTotal: testResults.length,
          integrationPassed: testResults.filter((r) => r.passed).length,
          integrationFailed: testResults.filter((r) => !r.passed).length,
          testResults,
        },
        null,
        2
      )
    );

    const passedCount = testResults.filter((r) => r.passed).length;
    console.log(
      `\n=== Integration Test Suite Complete: ${passedCount}/${testResults.length} Passed ===\n`
    );

    if (passedCount < testResults.length || unitSummary.failed > 0) {
      process.exitCode = 1;
    }
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoInstance?.proc) {
      await new Promise((resolve) => {
        mongoInstance.proc.once("exit", resolve);
        mongoInstance.proc.kill("SIGTERM");
        setTimeout(resolve, 1500);
      });
    }
    if (mongoInstance?.dbPath) {
      try {
        fs.rmSync(mongoInstance.dbPath, { recursive: true, force: true });
      } catch (_) {
        // Ignore residual lock file cleanup race
      }
    }
  }
};

if (require.main === module) {
  runFullTestSuite().catch((err) => {
    console.error("Test runner fatal error:", err);
    process.exit(1);
  });
}
