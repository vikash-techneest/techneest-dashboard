const mongoose = require("mongoose");

const attendanceAuditSchema = new mongoose.Schema(
  {
    attendanceRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      default: null,
      index: true,
    },
    registerRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceRegister",
      default: null,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    attendanceDate: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        "CHECK_IN",
        "CHECK_OUT",
        "CORRECTION_REQUESTED",
        "APPROVED",
        "REJECTED",
        "CORRECTION_APPROVED",
        "CORRECTION_REJECTED",
        "MANUAL_ADJUSTMENT",
      ],
      required: true,
    },
    performedByType: {
      type: String,
      enum: ["Admin", "Employee", "System"],
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
    },
    previousState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    reason: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.AttendanceAudit ||
  mongoose.model("AttendanceAudit", attendanceAuditSchema);
