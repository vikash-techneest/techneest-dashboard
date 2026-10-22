const mongoose = require("mongoose");
const Task = require("../../models/Task");
const Employee = require("../../models/Employee");
const Notification = require("../../models/Notification");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const {
  parsePagination,
  buildPaginationMeta,
  escapeRegex,
} = require("../../utils/pagination");
const { recordAuditLog } = require("../../utils/auditLogger");
const ApiError = require("../../utils/ApiError");

/**
 * Helper to resolve employee from assignee ID, employeeId code, or fullName (as used in AssignTask.jsx select)
 */
const resolveAssigneeEmployee = async (assigneeInput) => {
  if (!assigneeInput) {
    throw new ApiError(400, "Assignee is required");
  }

  let emp = null;
  if (mongoose.Types.ObjectId.isValid(assigneeInput)) {
    emp = await Employee.findOne({ _id: assigneeInput, isDeleted: false });
  }
  if (!emp) {
    emp = await Employee.findOne({
      employeeId: String(assigneeInput).toUpperCase().trim(),
      isDeleted: false,
    });
  }
  if (!emp) {
    emp = await Employee.findOne({
      fullName: {
        $regex: `^${escapeRegex(String(assigneeInput).trim())}$`,
        $options: "i",
      },
      isDeleted: false,
    });
  }

  if (!emp) {
    throw new ApiError(
      404,
      `Assignee employee (${assigneeInput}) not found`
    );
  }

  return emp;
};

const parseChecklistInput = (checklist) => {
  if (!checklist) return [];
  if (Array.isArray(checklist)) {
    return checklist.map((item) =>
      typeof item === "string"
        ? { text: item.trim(), completed: false }
        : { text: String(item.text || "").trim(), completed: Boolean(item.completed) }
    );
  }
  return String(checklist)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text) => ({ text, completed: false }));
};

const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description = "",
    project,
    assignees,
    assignee,
    priority = "Normal",
    startDate,
    dueDate,
    notifyEmployee = true,
    repeatTask = "No repeat",
    checklist,
    isDraft = false,
  } = req.body;

  const targetAssigneeInput = assignee || assignees;
  const emp = await resolveAssigneeEmployee(targetAssigneeInput);

  const attachments = [];
  if (req.file) {
    attachments.push({
      fileName: req.file.originalname,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedAt: new Date(),
    });
  }

  const draftFlag = isDraft === true || isDraft === "true";

  const task = await Task.create({
    title: String(title).trim(),
    description: String(description).trim(),
    project: String(project).trim(),
    taskType: "AdminAssigned",
    assignee: emp._id,
    assigneeName: emp.fullName,
    assigneeEmployeeId: emp.employeeId,
    assignedByAdmin: req.admin._id,
    priority,
    status: draftFlag ? "Draft" : "Assigned",
    startDate: startDate ? new Date(startDate) : new Date(),
    dueDate: new Date(dueDate),
    notifyEmployee: notifyEmployee === true || notifyEmployee === "true",
    repeatTask,
    checklist: parseChecklistInput(checklist),
    attachments,
    isDraft: draftFlag,
  });

  if (task.notifyEmployee && !draftFlag) {
    await Notification.create({
      recipientType: "Employee",
      recipientId: emp._id,
      title: "New Task Assigned",
      message: `You have been assigned a new ${priority} priority task: "${task.title}" (${task.project})`,
      category: "Task",
      metadata: { taskId: task._id, dueDate: task.dueDate },
    });
  }

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: req.admin._id,
    actorEmail: req.admin.email,
    action: draftFlag ? "TASK_DRAFT_SAVED" : "TASK_ASSIGNED",
    module: "TASK",
    targetId: task._id,
    description: `${draftFlag ? "Saved task draft" : "Assigned task"} "${task.title}" to ${emp.fullName} (${emp.employeeId})`,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: draftFlag
      ? "Task draft saved successfully"
      : "Task assigned successfully",
    data: task,
  });
});

const listTasks = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = { isDeleted: false };

  if (req.query.search) {
    const safe = escapeRegex(req.query.search.trim());
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { assigneeName: { $regex: safe, $options: "i" } },
      { project: { $regex: safe, $options: "i" } },
    ];
  }

  if (req.query.status && req.query.status !== "All" && req.query.status !== "Status") {
    filter.status = req.query.status;
  }

  if (req.query.assignee && req.query.assignee !== "All" && req.query.assignee !== "Assignee") {
    const safeAssignee = escapeRegex(req.query.assignee);
    filter.$or = [
      { assigneeName: { $regex: safeAssignee, $options: "i" } },
      { assigneeEmployeeId: { $regex: safeAssignee, $options: "i" } },
    ];
  }

  if (req.query.priority && req.query.priority !== "All") {
    filter.priority = req.query.priority;
  }

  const [
    total,
    tasks,
    allCount,
    inProgressCount,
    completedCount,
  ] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .populate("assignee", "employeeId fullName email department role")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Task.countDocuments({ isDeleted: false }),
    Task.countDocuments({ isDeleted: false, status: "In Progress" }),
    Task.countDocuments({
      isDeleted: false,
      status: { $in: ["Completed", "Done"] },
    }),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Tasks fetched successfully",
    data: {
      stats: {
        allTasks: allCount,
        inProgress: inProgressCount,
        completed: completedCount,
      },
      tasks,
    },
    pagination: buildPaginationMeta(total, page, limit),
  });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    isDeleted: false,
  }).populate("assignee", "employeeId fullName email department role");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const now = new Date();
  const start = new Date(task.startDate);
  const end = new Date(task.dueDate);
  const isCompleted = ["Completed", "Done"].includes(task.status);
  const isOverdue = !isCompleted && now > end;
  const totalMs = Math.max(1, end - start);
  const elapsedMs = Math.max(0, now - start);
  const timeElapsedPercentage = isCompleted
    ? 100
    : Math.min(100, Math.floor((elapsedMs / totalMs) * 100));

  return sendSuccess(res, {
    statusCode: 200,
    message: "Task details fetched successfully",
    data: {
      task,
      timeline: {
        isCompleted,
        isOverdue,
        timeElapsedPercentage,
      },
    },
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, isDeleted: false });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const {
    title,
    description,
    project,
    assignees,
    assignee,
    priority,
    status,
    startDate,
    dueDate,
    notifyEmployee,
    repeatTask,
    checklist,
    isDraft,
  } = req.body;

  if (title !== undefined) task.title = String(title).trim();
  if (description !== undefined) task.description = String(description).trim();
  if (project !== undefined) task.project = String(project).trim();
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) {
    task.status = status;
    if (["Completed", "Done"].includes(status)) {
      task.completedAt = new Date();
    }
  }
  if (startDate !== undefined) task.startDate = new Date(startDate);
  if (dueDate !== undefined) task.dueDate = new Date(dueDate);
  if (notifyEmployee !== undefined) task.notifyEmployee = Boolean(notifyEmployee);
  if (repeatTask !== undefined) task.repeatTask = repeatTask;
  if (checklist !== undefined) task.checklist = parseChecklistInput(checklist);
  if (isDraft !== undefined) task.isDraft = Boolean(isDraft);

  if (assignee || assignees) {
    const emp = await resolveAssigneeEmployee(assignee || assignees);
    task.assignee = emp._id;
    task.assigneeName = emp.fullName;
    task.assigneeEmployeeId = emp.employeeId;
  }

  await task.save();

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: req.admin._id,
    actorEmail: req.admin.email,
    action: "TASK_UPDATED",
    module: "TASK",
    targetId: task._id,
    description: `Updated task "${task.title}"`,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Task updated successfully",
    data: task,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, isDeleted: false });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  task.isDeleted = true;
  await task.save();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Task deleted successfully",
    data: { taskId: task._id, isDeleted: true },
  });
});

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
