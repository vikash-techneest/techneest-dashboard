const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userType: {
      type: String,
      enum: ["Admin", "Employee"],
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
      index: true,
    },
    employeeIdCode: {
      type: String,
      default: null,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
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
    status: {
      type: String,
      enum: ["Active", "LoggedOut", "Revoked", "Expired"],
      default: "Active",
      index: true,
    },
    loginAt: {
      type: Date,
      default: Date.now,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    logoutAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);
