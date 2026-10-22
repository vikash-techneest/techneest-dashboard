const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Holiday = require("../models/Holiday");
const { getOrCreateActivePolicy } = require("../services/attendance/attendanceService");
const { toISTDateString } = require("../utils/dateTime");

/**
 * Job to auto-mark employees as Absent if they did not check in on a working day
 * and autoMarkAbsent is enabled in AttendancePolicy (Settings.jsx).
 */
const runAutoMarkAbsentJob = async (targetDateStr = toISTDateString(new Date())) => {
  const policy = await getOrCreateActivePolicy();
  if (!policy.autoMarkAbsent) {
    return { skipped: true, reason: "autoMarkAbsent is disabled in AttendancePolicy" };
  }

  const [yearStr, monthStr, dayStr] = targetDateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  const dateObj = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = dateObj.getUTCDay();
  if ((policy.weeklyOffDays || [0]).includes(dayOfWeek)) {
    return { skipped: true, reason: "Target date is a weekly off" };
  }

  const holiday = await Holiday.findOne({ date: targetDateStr });
  if (holiday) {
    return { skipped: true, reason: `Target date is a holiday (${holiday.name})` };
  }

  const activeEmployees = await Employee.find({
    status: "Active",
    isDeleted: false,
  });

  let markedCount = 0;
  for (const emp of activeEmployees) {
    const existing = await Attendance.findOne({
      employee: emp._id,
      attendanceDate: targetDateStr,
    });
    if (existing) continue;

    const approvedLeave = await Leave.findOne({
      employee: emp._id,
      status: "Approved",
      startDate: { $lte: targetDateStr },
      endDate: { $gte: targetDateStr },
    });

    await Attendance.create({
      employee: emp._id,
      employeeId: emp.employeeId,
      attendanceDate: targetDateStr,
      month,
      year,
      attendanceStatus: approvedLeave ? "On Leave" : "Absent",
      approvalStatus: "Pending",
      notes: approvedLeave
        ? `Approved Leave (${approvedLeave.leaveType})`
        : "Auto-marked absent by system end-of-day job",
    });
    markedCount++;
  }

  return {
    skipped: false,
    date: targetDateStr,
    markedCount,
  };
};

module.exports = {
  runAutoMarkAbsentJob,
};
