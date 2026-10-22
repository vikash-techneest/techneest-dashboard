const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: ["Admin", "Employee"],
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: "userType",
      index: true,
    },
    employeeId: {
      type: String,
      default: null,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sessionId: {
      type: String,
      default: null,
      index: true,
    },
    loginDate: {
      type: String, // YYYY-MM-DD in Asia/Kolkata
      required: true,
      index: true,
    },
    loginTime: {
      type: String, // HH:mm AM/PM in Asia/Kolkata
      required: true,
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    loginTimestampUTC: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    logoutTimestampUTC: {
      type: Date,
      default: null,
    },
    logoutTime: {
      type: String,
      default: null,
    },
    lastActivityTimestamp: {
      type: Date,
      default: Date.now,
    },
    sessionDurationMinutes: {
      type: Number,
      default: 0,
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    deviceInfo: {
      browser: { type: String, default: "Unknown Browser" },
      os: { type: String, default: "Unknown OS" },
      deviceType: { type: String, default: "Desktop" },
      raw: { type: String, default: "" },
    },
    sessionStatus: {
      type: String,
      enum: ["Active", "Completed", "Failed", "Locked", "Revoked"],
      default: "Active",
      index: true,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.LoginHistory ||
  mongoose.model("LoginHistory", loginHistorySchema);
