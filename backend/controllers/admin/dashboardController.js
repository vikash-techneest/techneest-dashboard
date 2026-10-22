const Employee = require("../../models/Employee");
const Task = require("../../models/Task");
const Attendance = require("../../models/Attendance");
const Session = require("../../models/Session");
const Department = require("../../models/Department");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const {
  toISTDateString,
  toISTTimeString,
  formatDurationMinutes,
} = require("../../utils/dateTime");
const { escapeRegex } = require("../../utils/pagination");

/**
 * Admin Dashboard Overview API (matches Dashboard.jsx & Sidebar.jsx Quick Stats)
 */
const getDashboardOverview = asyncHandler(async (req, res) => {
  const todayStr = toISTDateString(new Date());
  const now = new Date();

  const [
    employees,
    activeSessionsCount,
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    todayAttendances,
    recentTasks,
    departments,
  ] = await Promise.all([
    Employee.find({ isDeleted: false, status: "Active" }).select(
      "_id employeeId fullName department role"
    ),
    Session.countDocuments({
      userType: "Employee",
      status: "Active",
      expiresAt: { $gt: now },
    }),
    Task.countDocuments({ isDeleted: false }),
    Task.countDocuments({
      isDeleted: false,
      status: { $in: ["Completed", "Done"] },
    }),
    Task.countDocuments({ isDeleted: false, status: "In Progress" }),
    Task.countDocuments({
      isDeleted: false,
      status: { $in: ["Pending", "Assigned", "To Do"] },
    }),
    Attendance.find({ attendanceDate: todayStr }),
    Task.find({ isDeleted: false }).sort({ updatedAt: -1 }).limit(10),
    Department.find({ isDeleted: false }),
  ]);

  const totalEmployees = employees.length;
  const presentEmpIds = new Set(
    todayAttendances
      .filter((a) =>
        ["Present", "Late", "Working", "Half Day"].includes(a.attendanceStatus)
      )
      .map((a) => String(a.employee))
  );
  const presentTodayCount = presentEmpIds.size;
  const absentTodayCount = Math.max(0, totalEmployees - presentTodayCount);
  const attendancePercentage =
    totalEmployees > 0
      ? Math.round((presentTodayCount / totalEmployees) * 100)
      : 0;

  // Department-wise attendance progress bars (Dashboard.jsx)
  const deptNames = Array.from(
    new Set([
      ...departments.map((d) => d.name),
      ...employees.map((e) => e.department).filter(Boolean),
    ])
  );

  const departmentWiseAttendance = deptNames.map((deptName) => {
    const deptEmps = employees.filter(
      (e) => (e.department || "").toLowerCase() === deptName.toLowerCase()
    );
    const presentInDept = deptEmps.filter((e) =>
      presentEmpIds.has(String(e._id))
    ).length;
    const totalInDept = deptEmps.length;
    const percentage =
      totalInDept > 0 ? Math.round((presentInDept / totalInDept) * 100) : 0;

    return {
      department: deptName,
      present: presentInDept,
      total: totalInDept,
      label: `${presentInDept}/${totalInDept}`,
      percentage,
    };
  });

  // Recent Team Activity table (Dashboard.jsx)
  const recentTeamActivity = recentTasks.map((t) => {
    const initials = String(t.assigneeName || "U")
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");

    return {
      id: t._id,
      name: t.assigneeName,
      employeeId: t.assigneeEmployeeId,
      initials,
      task: t.title,
      status: t.status,
      time: toISTTimeString(t.updatedAt),
    };
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Dashboard overview fetched successfully",
    data: {
      date: todayStr,
      statsCards: {
        totalEmployees,
        activeNow: activeSessionsCount || presentTodayCount,
        totalTasks,
        completedTasks,
        inProgress: inProgressTasks,
        pendingTasks,
        attendanceTodayLabel: `${presentTodayCount}/${totalEmployees}`,
        presentToday: presentTodayCount,
        absentToday: absentTodayCount,
      },
      sidebarQuickStats: {
        employees: totalEmployees,
        activeToday: presentTodayCount,
        tasksDone: completedTasks,
        pending: pendingTasks + inProgressTasks,
      },
      recentTeamActivity,
      attendanceOverview: {
        percentage: attendancePercentage,
        present: presentTodayCount,
        absent: absentTodayCount,
        total: totalEmployees,
        departmentWiseAttendance,
      },
    },
  });
});

/**
 * Global Topbar Search (Search employees, tasks, departments)
 */
const globalSearch = asyncHandler(async (req, res) => {
  const q = String(req.query.q || req.query.search || "").trim();
  if (!q) {
    return sendSuccess(res, {
      statusCode: 200,
      message: "Empty search query",
      data: { employees: [], tasks: [], departments: [] },
    });
  }

  const safe = escapeRegex(q);
  const [employees, tasks, departments] = await Promise.all([
    Employee.find({
      isDeleted: false,
      $or: [
        { fullName: { $regex: safe, $options: "i" } },
        { employeeId: { $regex: safe, $options: "i" } },
        { email: { $regex: safe, $options: "i" } },
      ],
    })
      .select("employeeId fullName email department role status")
      .limit(10),
    Task.find({
      isDeleted: false,
      $or: [
        { title: { $regex: safe, $options: "i" } },
        { project: { $regex: safe, $options: "i" } },
        { assigneeName: { $regex: safe, $options: "i" } },
      ],
    })
      .select("title project assigneeName status priority dueDate")
      .limit(10),
    Department.find({
      isDeleted: false,
      name: { $regex: safe, $options: "i" },
    })
      .select("name code description")
      .limit(10),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Search results fetched successfully",
    data: { employees, tasks, departments },
  });
});

/**
 * Reports & Analytics API (matches Reports.jsx)
 */
const getAnalyticsReports = asyncHandler(async (req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalEmployees,
    completedTasksWeek,
    recentAttendances,
  ] = await Promise.all([
    Employee.countDocuments({ isDeleted: false, status: "Active" }),
    Task.find({
      isDeleted: false,
      status: { $in: ["Completed", "Done"] },
      updatedAt: { $gte: sevenDaysAgo },
    }),
    Attendance.find({
      checkInTime: { $gte: sevenDaysAgo },
      workingDurationMinutes: { $gt: 0 },
    }),
  ]);

  const avgMinutes =
    recentAttendances.length > 0
      ? Math.round(
          recentAttendances.reduce(
            (sum, a) => sum + (a.workingDurationMinutes || 0),
            0
          ) / recentAttendances.length
        )
      : 465; // 7h 45m fallback when no records yet

  // Build MON - FRI weekly chart data (Reports.jsx)
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const dayCounts = { MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0 };

  for (const t of completedTasksWeek) {
    const dName = dayNames[new Date(t.updatedAt).getUTCDay()];
    if (dayCounts[dName] !== undefined) {
      dayCounts[dName]++;
    }
  }

  const weeklyData = ["MON", "TUE", "WED", "THU", "FRI"].map((day) => ({
    day,
    tasks: dayCounts[day],
  }));

  return sendSuccess(res, {
    statusCode: 200,
    message: "Reports & analytics fetched successfully",
    data: {
      topStats: {
        totalEmployees,
        tasksCompletedWeek: completedTasksWeek.length,
        avgHoursLogged: formatDurationMinutes(avgMinutes),
        avgMinutesLogged: avgMinutes,
      },
      weeklyData,
    },
  });
});

/**
 * Export Report CSV (matches Export Report button in Reports.jsx)
 */
const exportReportsCSV = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ isDeleted: false }).sort({
    employeeId: 1,
  });
  const tasks = await Task.find({ isDeleted: false });

  const headers = [
    "Employee ID",
    "Name",
    "Department",
    "Role",
    "Total Tasks",
    "Completed Tasks",
    "Present Days (Current Month)",
  ];

  const rows = employees.map((emp) => {
    const empTasks = tasks.filter(
      (t) => String(t.assignee) === String(emp._id)
    );
    const doneCount = empTasks.filter((t) =>
      ["Completed", "Done"].includes(t.status)
    ).length;

    return [
      emp.employeeId,
      `"${emp.fullName.replace(/"/g, '""')}"`,
      `"${emp.department}"`,
      `"${emp.role}"`,
      empTasks.length,
      doneCount,
      emp.attendanceSummary?.currentMonthPresentDays || 0,
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");

  return sendSuccess(res, {
    statusCode: 200,
    message: "Performance report exported successfully",
    data: {
      fileName: `Performance_Report_${toISTDateString(new Date())}.csv`,
      totalRecords: employees.length,
      csv: csvContent,
    },
  });
});

module.exports = {
  getDashboardOverview,
  globalSearch,
  getAnalyticsReports,
  exportReportsCSV,
};
