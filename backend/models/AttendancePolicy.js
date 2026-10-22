const mongoose = require("mongoose");

const attendancePolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    standardLoginTime: {
      type: String, // "09:00"
      default: "09:00",
    },
    lateThresholdTime: {
      type: String, // "09:30"
      default: "09:30",
    },
    gracePeriodMinutes: {
      type: Number,
      default: 30,
    },
    standardLogoutTime: {
      type: String, // "18:00"
      default: "18:00",
    },
    earlyCheckoutThresholdMinutes: {
      type: Number,
      default: 15,
    },
    fullDayMinHours: {
      type: Number,
      default: 8,
    },
    halfDayMinHours: {
      type: Number,
      default: 4,
    },
    overtimeMinMinutesAfterShift: {
      type: Number,
      default: 30,
    },
    overtimeRequiresApproval: {
      type: Boolean,
      default: true,
    },
    autoMarkAbsent: {
      type: Boolean,
      default: true,
    },
    ipWhitelistingEnabled: {
      type: Boolean,
      default: false,
    },
    allowedIpAddresses: {
      type: [String],
      default: [],
    },
    emailNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    pushNotificationsEnabled: {
      type: Boolean,
      default: false,
    },
    weeklyOffDays: {
      type: [Number], // 0 = Sunday, 6 = Saturday
      default: [0],
    },
    saturdayHalfDay: {
      type: Boolean,
      default: false,
    },
    monthlyWorkingDaysOverride: {
      type: Map,
      of: Number, // e.g., "2026-10": 24
      default: {},
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.AttendancePolicy ||
  mongoose.model("AttendancePolicy", attendancePolicySchema);
