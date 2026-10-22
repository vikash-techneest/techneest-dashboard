const mongoose = require("mongoose");

const attendanceRegisterSchema = new mongoose.Schema(
  {
    attendanceRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      required: false,
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
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    month: {
      type: Number, // 1-12
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    officialStatus: {
      type: String,
      enum: ["Present", "Late", "Half Day", "Absent", "Paid Leave", "Unpaid Leave", "Holiday", "Weekly Off"],
      required: true,
    },
    payableDayValue: {
      type: Number, // 1.0, 0.5, or 0.0
      required: true,
      default: 1.0,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    workingDurationMinutes: {
      type: Number,
      default: 0,
    },
    overtimeMinutes: {
      type: Number,
      default: 0,
    },
    lateByMinutes: {
      type: Number,
      default: 0,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    approvedAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: "",
    },
    isManualAdjustment: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate approved attendance entries in the official register
attendanceRegisterSchema.index({ employee: 1, attendanceDate: 1 }, { unique: true });

module.exports =
  mongoose.models.AttendanceRegister ||
  mongoose.model("AttendanceRegister", attendanceRegisterSchema);
