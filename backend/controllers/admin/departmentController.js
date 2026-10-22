const mongoose = require("mongoose");
const Department = require("../../models/Department");
const Employee = require("../../models/Employee");
const Task = require("../../models/Task");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const { escapeRegex } = require("../../utils/pagination");
const { recordAuditLog } = require("../../utils/auditLogger");
const ApiError = require("../../utils/ApiError");

const findDepartmentByIdOrName = async (idOrName) => {
  let dept = null;
  if (mongoose.Types.ObjectId.isValid(idOrName)) {
    dept = await Department.findOne({ _id: idOrName, isDeleted: false });
  }
  if (!dept) {
    dept = await Department.findOne({
      $or: [
        { code: String(idOrName).toUpperCase().trim() },
        { name: { $regex: `^${escapeRegex(idOrName)}$`, $options: "i" } },
      ],
      isDeleted: false,
    });
  }
  if (!dept) {
    throw new ApiError(404, "Department not found");
  }
  return dept;
};

/**
 * Lists all departments enriched with employees, activeTasks, completedTasks, totalTasks, and completionRate
 * matching Departments.jsx
 */
const listDepartments = asyncHandler(async (req, res) => {
  const filter = { isDeleted: false };
  if (req.query.search) {
    const safe = escapeRegex(req.query.search.trim());
    filter.name = { $regex: safe, $options: "i" };
  }

  const departments = await Department.find(filter).sort({ name: 1 });
  const allEmployees = await Employee.find({ isDeleted: false }).select(
    "employeeId fullName email role designation department status"
  );
  const allTasks = await Task.find({ isDeleted: false }).select(
    "assignee status"
  );

  const enriched = departments.map((dept) => {
    const deptEmployees = allEmployees.filter(
      (e) =>
        (e.department || "").toLowerCase() === dept.name.toLowerCase()
    );
    const empIdsSet = new Set(deptEmployees.map((e) => String(e._id)));
    const deptTasks = allTasks.filter((t) =>
      empIdsSet.has(String(t.assignee))
    );

    const totalTasks = deptTasks.length;
    const completedTasks = deptTasks.filter((t) =>
      ["Completed", "Done"].includes(t.status)
    ).length;
    const activeTasks = deptTasks.filter((t) =>
      ["Assigned", "To Do", "Pending", "In Progress"].includes(t.status)
    ).length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      _id: dept._id,
      id: dept._id,
      name: dept.name,
      code: dept.code,
      description: dept.description,
      icon: dept.icon,
      color: dept.color,
      bg: dept.bg,
      border: dept.border,
      designations: dept.designations,
      teamSize: deptEmployees.length,
      employees: deptEmployees.map((emp) => ({
        _id: emp._id,
        id: emp.employeeId,
        name: emp.fullName,
        role: emp.role,
        email: emp.email,
        status: emp.status,
      })),
      activeTasks,
      completedTasks,
      totalTasks,
      completionRate,
    };
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Departments fetched successfully",
    data: {
      totalDepartments: enriched.length,
      departments: enriched,
    },
  });
});

const createDepartment = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    description = "",
    icon = "Building2",
    color = "text-blue-400",
    bg = "bg-blue-500/10",
    border = "hover:border-blue-500/40",
    designations = [],
  } = req.body;

  const existing = await Department.findOne({
    name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" },
    isDeleted: false,
  });
  if (existing) {
    throw new ApiError(409, "A department with this name already exists");
  }

  const generatedCode =
    code ||
    String(name)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8) ||
    `DEPT${Date.now()}`;

  const dept = await Department.create({
    name: String(name).trim(),
    code: generatedCode,
    description,
    icon,
    color,
    bg,
    border,
    designations: Array.isArray(designations) ? designations : [],
  });

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: req.admin._id,
    actorEmail: req.admin.email,
    action: "DEPARTMENT_CREATED",
    module: "DEPARTMENT",
    targetId: dept._id,
    description: `Created department ${dept.name} (${dept.code})`,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Department created successfully",
    data: dept,
  });
});

const getDepartmentDetails = asyncHandler(async (req, res) => {
  const dept = await findDepartmentByIdOrName(req.params.id);
  const employees = await Employee.find({
    department: { $regex: `^${escapeRegex(dept.name)}$`, $options: "i" },
    isDeleted: false,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Department details fetched successfully",
    data: {
      department: dept,
      employees: employees.map((emp) => ({
        _id: emp._id,
        id: emp.employeeId,
        name: emp.fullName,
        role: emp.role,
        email: emp.email,
        status: emp.status,
      })),
    },
  });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const dept = await findDepartmentByIdOrName(req.params.id);
  const oldName = dept.name;

  const { name, code, description, icon, color, bg, border, designations } =
    req.body;

  if (name) dept.name = String(name).trim();
  if (code) dept.code = String(code).toUpperCase().trim();
  if (description !== undefined) dept.description = description;
  if (icon) dept.icon = icon;
  if (color) dept.color = color;
  if (bg) dept.bg = bg;
  if (border) dept.border = border;
  if (Array.isArray(designations)) dept.designations = designations;

  await dept.save();

  if (name && name !== oldName) {
    await Employee.updateMany(
      { department: oldName },
      { $set: { department: dept.name } }
    );
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: "Department updated successfully",
    data: dept,
  });
});

/**
 * Updates an employee's name, role, or email inside a Department modal (matches Departments.jsx handleSaveEdit)
 */
const updateEmployeeInDepartment = asyncHandler(async (req, res) => {
  const dept = await findDepartmentByIdOrName(req.params.id);
  const { empId } = req.params;
  const { name, fullName, role, email } = req.body;

  const empQuery = mongoose.Types.ObjectId.isValid(empId)
    ? { _id: empId, isDeleted: false }
    : { employeeId: String(empId).toUpperCase().trim(), isDeleted: false };

  const employee = await Employee.findOne(empQuery);
  if (!employee) {
    throw new ApiError(404, "Employee not found in this department");
  }

  if (name || fullName) employee.fullName = String(name || fullName).trim();
  if (role) {
    employee.role = String(role).trim();
    employee.designation = String(role).trim();
  }
  if (email) employee.email = String(email).toLowerCase().trim();

  await employee.save();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Department team member updated successfully",
    data: {
      department: dept.name,
      employee: {
        id: employee.employeeId,
        name: employee.fullName,
        role: employee.role,
        email: employee.email,
      },
    },
  });
});

/**
 * Removes an employee from a department (matches Departments.jsx handleDelete)
 */
const removeEmployeeFromDepartment = asyncHandler(async (req, res) => {
  const dept = await findDepartmentByIdOrName(req.params.id);
  const { empId } = req.params;

  const empQuery = mongoose.Types.ObjectId.isValid(empId)
    ? { _id: empId, isDeleted: false }
    : { employeeId: String(empId).toUpperCase().trim(), isDeleted: false };

  const employee = await Employee.findOne(empQuery);
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  employee.department = "Unassigned";
  employee.departmentRef = null;
  await employee.save();

  return sendSuccess(res, {
    statusCode: 200,
    message: `Removed ${employee.fullName} from ${dept.name} department`,
    data: {
      employeeId: employee.employeeId,
      previousDepartment: dept.name,
      currentDepartment: employee.department,
    },
  });
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const dept = await findDepartmentByIdOrName(req.params.id);
  dept.isDeleted = true;
  dept.isActive = false;
  await dept.save();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Department deleted successfully",
    data: { id: dept._id, name: dept.name, isDeleted: true },
  });
});

module.exports = {
  listDepartments,
  createDepartment,
  getDepartmentDetails,
  updateDepartment,
  updateEmployeeInDepartment,
  removeEmployeeFromDepartment,
  deleteDepartment,
};
