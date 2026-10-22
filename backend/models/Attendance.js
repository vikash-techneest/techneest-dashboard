const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
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
      type: String, // YYYY-MM-DD in Asia/Kolkata
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
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    checkInDisplay: {
      type: String,
      default: "—",
    },
    checkOutDisplay: {
      type: String,
      default: "—",
    },
    workingDurationMinutes: {
      type: Number,
      default: 0,
    },
    workingHoursDecimal: {
      type: Number,
      default: 0,
    },
    durationDisplay: {
      type: String,
      default: "0h 0m",
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    lateByMinutes: {
      type: Number,
      default: 0,
    },
    lateByDisplay: {
      type: String,
      default: null,
    },
    isEarlyCheckout: {
      type: Boolean,
      default: false,
    },
    earlyCheckoutByMinutes: {
      type: Number,
      default: 0,
    },
    isHalfDay: {
      type: Boolean,
      default: false,
    },
    overtimeMinutes: {
      type: Number,
      default: 0,
    },
    attendanceStatus: {
      type: String,
      enum: ["Working", "Present", "Late", "Half Day", "Absent", "On Leave", "Holiday"],
      default: "Working",
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Correction Requested"],
      default: "Pending",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewReason: {
      type: String,
      default: null,
    },
    correctionRequest: {
      isRequested: { type: Boolean, default: false },
      requestedAt: { type: Date, default: null },
      originalCheckInTime: { type: Date, default: null },
      originalCheckOutTime: { type: Date, default: null },
      requestedCheckInTime: { type: Date, default: null },
      requestedCheckOutTime: { type: Date, default: null },
      reason: { type: String, default: null },
      resolutionStatus: {
        type: String,
        enum: ["None", "Pending", "Approved", "Rejected"],
        default: "None",
      },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null,
      },
      resolvedAt: { type: Date, default: null },
      resolutionComment: { type: String, default: null },
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, attendanceDate: 1 }, { unique: true });

module.exports =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
