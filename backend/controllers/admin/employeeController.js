const mongoose = require("mongoose");
const Employee = require("../../models/Employee");
const Department = require("../../models/Department");
const SalaryStructure = require("../../models/SalaryStructure");
const LoginHistory = require("../../models/LoginHistory");
const Session = require("../../models/Session");
const Attendance = require("../../models/Attendance");
const AttendanceRegister = require("../../models/AttendanceRegister");
const Payroll = require("../../models/Payroll");
const Task = require("../../models/Task");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const {
  parsePagination,
  buildPaginationMeta,
  escapeRegex,
} = require("../../utils/pagination");
const {
  getMonthCalendarDetails,
  formatDurationMinutes,
} = require("../../utils/dateTime");
const { recordAuditLog } = require("../../utils/auditLogger");

/**
 * Helper to resolve an employee by Mongo ObjectId or employeeId code (e.g. WB-024)
 */
const findEmployeeByIdOrCode = async (idOrCode) => {
  const query = mongoose.Types.ObjectId.isValid(idOrCode)
    ? { _id: idOrCode, isDeleted: false }
    : { employeeId: String(idOrCode).toUpperCase().trim(), isDeleted: false };

  const emp = await Employee.findOne(query).populate(
    "reportingManager",
    "employeeId fullName email role department"
  );
  if (!emp) {
    throw new ApiError(404, "Employee not found");
  }
  return emp;
};

/**
 * Auto-generates next sequential Employee ID code (e.g. WB-001, WB-025)
 */
const generateNextEmployeeCode = async () => {
  const all = await Employee.find({}, { employeeId: 1 }).lean();
  let maxNum = 0;
  for (const item of all) {
    const match = String(item.employeeId || "").match(/WB-(\d+)/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  const nextNum = maxNum + 1;
  return `WB-${String(nextNum).padStart(3, "0")}`;
};

const createEmployee = asyncHandler(async (req, res) => {
  const {
    fullName,
    employeeId,
    email,
    password,
    phone,
    department,
    role,
    designation,
    reportingManager,
    joiningDate,
    salary,
    baseSalary,
    status,
    loginAccess,
    attendancePolicy,
    salaryCycle,
    permissions,
  } = req.body;

  const normalizedEmail = String(email).toLowerCase().trim();
  const existingEmail = await Employee.findOne({ email: normalizedEmail });
  if (existingEmail) {
    throw new ApiError(409, "An employee with this email already exists");
  }

  let empCode =
    employeeId &&
    employeeId !== "Auto-generated" &&
    String(employeeId).trim() !== ""
      ? String(employeeId).toUpperCase().trim()
      : await generateNextEmployeeCode();

  const existingCode = await Employee.findOne({ employeeId: empCode });
  if (existingCode) {
    empCode = await generateNextEmployeeCode();
  }

  const numericSalary = Number(baseSalary ?? salary ?? 0);
  if (Number.isNaN(numericSalary) || numericSalary < 0) {
    throw new ApiError(400, "Valid monthly base salary is required");
  }

  // Ensure Department document exists or link if matching
  let deptDoc = await Department.findOne({
    name: { $regex: `^${escapeRegex(department)}$`, $options: "i" },
    isDeleted: false,
  });
  if (!deptDoc) {
    const code = String(department)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6) || "DEPT";
    deptDoc = await Department.create({
      name: String(department).trim(),
      code: `${code}-${Date.now().toString().slice(-3)}`,
      designations: [role],
    });
  } else if (role && !deptDoc.designations.includes(role)) {
    deptDoc.designations.push(role);
    await deptDoc.save();
  }

  const employee = await Employee.create({
    employeeId: empCode,
    fullName: String(fullName).trim(),
    email: normalizedEmail,
    password,
    phone: phone || "",
    department: deptDoc.name,
    departmentRef: deptDoc._id,
    role: String(role).trim(),
    designation: designation ? String(designation).trim() : String(role).trim(),
    reportingManager:
      reportingManager && mongoose.Types.ObjectId.isValid(reportingManager)
        ? reportingManager
        : null,
    joiningDate: new Date(joiningDate),
    baseSalary: numericSalary,
    status: status || "Active",
    loginAccess: loginAccess || "Email + temporary password",
    attendancePolicy: attendancePolicy || "Standard office hours",
    salaryCycle: salaryCycle || "Monthly - calendar month",
    ...(Array.isArray(permissions) ? { permissions } : {}),
  });

  // Create corresponding SalaryStructure document
  await SalaryStructure.findOneAndUpdate(
    { employee: employee._id },
    {
      $set: {
        employee: employee._id,
        employeeId: employee.employeeId,
        baseSalary: numericSalary,
        updatedBy: req.admin._id,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: req.admin._id,
    actorEmail: req.admin.email,
    action: "EMPLOYEE_CREATED",
    module: "EMPLOYEE",
    targetId: employee.employeeId,
    description: `Created employee ${employee.fullName} (${employee.employeeId}) in ${employee.department}`,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Employee created successfully",
    data: employee,
  });
});

const listEmployees = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = { isDeleted: false };

  if (req.query.search) {
    const safeSearch = escapeRegex(req.query.search.trim());
    filter.$or = [
      { fullName: { $regex: safeSearch, $options: "i" } },
      { employeeId: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
      { role: { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (req.query.department && req.query.department !== "All") {
    filter.department = {
      $regex: `^${escapeRegex(req.query.department)}$`,
      $options: "i",
    };
  }

  if (req.query.status && req.query.status !== "All") {
    filter.status = req.query.status;
  }

  if (req.query.presenceStatus && req.query.presenceStatus !== "All") {
    filter.dailyPresenceStatus = req.query.presenceStatus;
  }

  if (req.query.role) {
    filter.role = { $regex: escapeRegex(req.query.role), $options: "i" };
  }

  const [total, employees] = await Promise.all([
    Employee.countDocuments(filter),
    Employee.find(filter)
      .populate("reportingManager", "employeeId fullName email role")
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employees fetched successfully",
    data: employees,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

const exportEmployeesCSV = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ isDeleted: false }).sort({
    employeeId: 1,
  });

  const headers = [
    "Employee ID",
    "Full Name",
    "Email",
    "Department",
    "Role",
    "Joining Date",
    "Base Salary (INR)",
    "Account Status",
    "Daily Presence",
  ];

  const rows = employees.map((emp) =>
    [
      emp.employeeId,
      `"${emp.fullName.replace(/"/g, '""')}"`,
      emp.email,
      `"${emp.department}"`,
      `"${emp.role}"`,
      emp.joiningDate ? new Date(emp.joiningDate).toISOString().slice(0, 10) : "",
      emp.baseSalary,
      emp.status,
      emp.dailyPresenceStatus,
    ].join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");

  if (req.query.format === "raw") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Employees_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.status(200).send(csvContent);
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employees CSV generated successfully",
    data: {
      fileName: `Employees_${new Date().toISOString().slice(0, 10)}.csv`,
      totalRecords: employees.length,
      csv: csvContent,
    },
  });
});

const getEmployeeDetails = asyncHandler(async (req, res) => {
  const employee = await findEmployeeByIdOrCode(req.params.id);

  const now = new Date();
  const month = Number(req.query.month) || now.getUTCMonth() + 1;
  const year = Number(req.query.year) || now.getUTCFullYear();

  const [
    totalTasks,
    completedTasks,
    salaryStructure,
    registerEntries,
    rawAttendances,
  ] = await Promise.all([
    Task.countDocuments({ assignee: employee._id, isDeleted: false }),
    Task.countDocuments({
      assignee: employee._id,
      status: { $in: ["Completed", "Done"] },
      isDeleted: false,
    }),
    SalaryStructure.findOne({ employee: employee._id }),
    AttendanceRegister.find({ employee: employee._id, month, year }),
    Attendance.find({ employee: employee._id, month, year }),
  ]);

  // Build monthly attendance calendar matching EmploiesDetails.jsx
  const calDetails = getMonthCalendarDetails(month, year, [0]);
  const regMap = new Map(registerEntries.map((r) => [r.attendanceDate, r]));
  const rawMap = new Map(rawAttendances.map((r) => [r.attendanceDate, r]));

  const monthlyCalendar = calDetails.days.map((d) => {
    const reg = regMap.get(d.dateString);
    const raw = rawMap.get(d.dateString);
    let status = d.isWeeklyOff ? "Weekly Off" : "Absent";
    let hours = "0h 0m";
    let approvalStatus = "None";

    if (reg) {
      status = reg.officialStatus;
      hours = formatDurationMinutes(reg.workingDurationMinutes);
      approvalStatus = "Approved";
    } else if (raw) {
      status = raw.attendanceStatus;
      hours = raw.durationDisplay || formatDurationMinutes(raw.workingDurationMinutes);
      approvalStatus = raw.approvalStatus;
    }

    return {
      date: d.day,
      dateString: d.dateString,
      dayName: d.dayName,
      status,
      hours,
      approvalStatus,
    };
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee details fetched successfully",
    data: {
      employee,
      taskStats: {
        totalTasks,
        completedTasks,
      },
      salaryStructure,
      monthlyAttendance: {
        month,
        year,
        calendar: monthlyCalendar,
      },
    },
  });
});

const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await findEmployeeByIdOrCode(req.params.id);

  // Whitelist allowed fields to prevent mass assignment
  const allowedFields = [
    "fullName",
    "email",
    "phone",
    "department",
    "role",
    "designation",
    "reportingManager",
    "joiningDate",
    "status",
    "dailyPresenceStatus",
    "loginAccess",
    "attendancePolicy",
    "salaryCycle",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === "email") {
        const newEmail = String(req.body.email).toLowerCase().trim();
        const duplicate = await Employee.findOne({
          email: newEmail,
          _id: { $ne: employee._id },
        });
        if (duplicate) {
          throw new ApiError(409, "Another employee is already using this email");
        }
        employee.email = newEmail;
      } else if (field === "joiningDate") {
        employee.joiningDate = new Date(req.body.joiningDate);
      } else if (field === "reportingManager") {
        employee.reportingManager =
          req.body.reportingManager &&
          mongoose.Types.ObjectId.isValid(req.body.reportingManager)
            ? req.body.reportingManager
            : null;
      } else {
        employee[field] = req.body[field];
      }
    }
  }

  if (req.body.salary !== undefined || req.body.baseSalary !== undefined) {
    const newBase = Number(req.body.baseSalary ?? req.body.salary);
    if (!Number.isNaN(newBase) && newBase >= 0) {
      employee.baseSalary = newBase;
      await SalaryStructure.findOneAndUpdate(
        { employee: employee._id },
        {
          $set: {
            employeeId: employee.employeeId,
            baseSalary: newBase,
            updatedBy: req.admin._id,
          },
        },
        { upsert: true }
      );
    }
  }

  if (req.body.password && String(req.body.password).trim().length >= 6) {
    employee.password = req.body.password;
  }

  await employee.save();

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: req.admin._id,
    actorEmail: req.admin.email,
    action: "EMPLOYEE_UPDATED",
    module: "EMPLOYEE",
    targetId: employee.employeeId,
    description: `Updated employee ${employee.fullName} (${employee.employeeId})`,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee updated successfully",
    data: employee,
  });
});

const updateEmployeeStatus = asyncHandler(async (req, res) => {
  const employee = await findEmployeeByIdOrCode(req.params.id);
  const { status } = req.body;

  employee.status = status;
  await employee.save();

  // If deactivated or suspended, revoke active sessions immediately
  if (status !== "Active") {
    await Session.updateMany(
      { userType: "Employee", userId: employee._id, status: "Active" },
      { $set: { status: "Revoked", logoutAt: new Date() } }
    );
  }

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: req.admin._id,
    actorEmail: req.admin.email,
    action: "EMPLOYEE_STATUS_CHANGED",
    module: "EMPLOYEE",
    targetId: employee.employeeId,
    description: `Changed employee ${employee.employeeId} status to ${status}`,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: `Employee status updated to ${status}`,
    data: {
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      status: employee.status,
    },
  });
});

const updateEmployeePermissions = asyncHandler(async (req, res) => {
  const employee = await findEmployeeByIdOrCode(req.params.id);
  const { role, designation, permissions } = req.body;

  if (role) employee.role = String(role).trim();
  if (designation) employee.designation = String(designation).trim();
  if (Array.isArray(permissions)) {
    employee.permissions = permissions.map((p) => String(p).trim());
  }

  await employee.save();

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: req.admin._id,
    actorEmail: req.admin.email,
    action: "EMPLOYEE_PERMISSIONS_UPDATED",
    module: "EMPLOYEE",
    targetId: employee.employeeId,
    description: `Updated role/permissions for employee ${employee.employeeId}`,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee role and permissions updated successfully",
    data: {
      employeeId: employee.employeeId,
      role: employee.role,
      designation: employee.designation,
      permissions: employee.permissions,
    },
  });
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await findEmployeeByIdOrCode(req.params.id);

  // Soft delete to preserve historical payroll and attendance records
  employee.isDeleted = true;
  employee.deletedAt = new Date();
  employee.status = "Inactive";
  await employee.save();

  await Session.updateMany(
    { userType: "Employee", userId: employee._id, status: "Active" },
    { $set: { status: "Revoked", logoutAt: new Date() } }
  );

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: req.admin._id,
    actorEmail: req.admin.email,
    action: "EMPLOYEE_SOFT_DELETED",
    module: "EMPLOYEE",
    targetId: employee.employeeId,
    description: `Soft-deleted employee ${employee.fullName} (${employee.employeeId})`,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee removed successfully",
    data: { employeeId: employee.employeeId, isDeleted: true },
  });
});

const uploadEmployeeDocument = asyncHandler(async (req, res) => {
  const employee = await findEmployeeByIdOrCode(req.params.id);

  const file = req.file;
  const { title, type = "Other", fileName: bodyFileName } = req.body;

  if (!file && !bodyFileName) {
    throw new ApiError(400, "Document file or file metadata is required");
  }

  const docEntry = {
    title: title || (file ? file.originalname : bodyFileName),
    type,
    fileName: file ? file.filename : bodyFileName,
    filePath: file ? file.path : `uploads/documents/${bodyFileName}`,
    mimeType: file ? file.mimetype : "application/pdf",
    fileSize: file ? file.size : 0,
    uploadedAt: new Date(),
    uploadedBy: req.admin._id,
  };

  employee.documents.push(docEntry);
  await employee.save();

  const savedDoc = employee.documents[employee.documents.length - 1];

  return sendSuccess(res, {
    statusCode: 201,
    message: "Employee document uploaded successfully",
    data: savedDoc,
  });
});

const listEmployeeDocuments = asyncHandler(async (req, res) => {
  const employee = await findEmployeeByIdOrCode(req.params.id);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee documents fetched successfully",
    data: employee.documents || [],
  });
});

const deleteEmployeeDocument = asyncHandler(async (req, res) => {
  const employee = await findEmployeeByIdOrCode(req.params.id);
  const { docId } = req.params;

  const doc = employee.documents.id(docId);
  if (!doc) {
    throw new ApiError(404, "Employee document not found");
  }

  doc.deleteOne();
  await employee.save();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee document deleted successfully",
    data: { deletedDocumentId: docId },
  });
});

const getEmployeeLoginHistory = asyncHandler(async (req, res) => {
  const employee = await findEmployeeByIdOrCode(req.params.id);
  const { page, limit, skip, sort } = parsePagination(req.query);

  const filter = {
    userType: "Employee",
    $or: [{ userId: employee._id }, { employeeId: employee.employeeId }],
  };

  if (req.query.date) {
    filter.loginDate = req.query.date;
  }

  const [total, logs] = await Promise.all([
    LoginHistory.countDocuments(filter),
    LoginHistory.find(filter).sort(sort).skip(skip).limit(limit),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee login history fetched successfully",
    data: {
      employee: {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        lastLoginAt: employee.lastLoginAt,
        lastActivityAt: employee.lastActivityAt,
      },
      history: logs,
    },
    pagination: buildPaginationMeta(total, page, limit),
  });
});

const getEmployeeAttendanceSummary = asyncHandler(async (req, res) => {
  const employee = await findEmployeeByIdOrCode(req.params.id);
  const now = new Date();
  const month = Number(req.query.month) || now.getUTCMonth() + 1;
  const year = Number(req.query.year) || now.getUTCFullYear();

  const [officialRecords, rawRecords] = await Promise.all([
    AttendanceRegister.find({ employee: employee._id, month, year }).sort({
      attendanceDate: 1,
    }),
    Attendance.find({ employee: employee._id, month, year }).sort({
      attendanceDate: 1,
    }),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee attendance summary fetched successfully",
    data: {
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      month,
      year,
      summary: employee.attendanceSummary,
      officialRegisterRecords: officialRecords,
      attendanceSubmissions: rawRecords,
    },
  });
});

const getEmployeePayrollHistory = asyncHandler(async (req, res) => {
  const employee = await findEmployeeByIdOrCode(req.params.id);
  const { page, limit, skip, sort } = parsePagination(req.query);

  const filter = { employee: employee._id };
  const [total, payrolls] = await Promise.all([
    Payroll.countDocuments(filter),
    Payroll.find(filter).sort(sort).skip(skip).limit(limit),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee payroll history fetched successfully",
    data: payrolls,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

module.exports = {
  createEmployee,
  listEmployees,
  exportEmployeesCSV,
  getEmployeeDetails,
  updateEmployee,
  updateEmployeeStatus,
  updateEmployeePermissions,
  deleteEmployee,
  uploadEmployeeDocument,
  listEmployeeDocuments,
  deleteEmployeeDocument,
  getEmployeeLoginHistory,
  getEmployeeAttendanceSummary,
  getEmployeePayrollHistory,
};
