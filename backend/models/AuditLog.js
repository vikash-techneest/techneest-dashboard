const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actorType: {
      type: String,
      enum: ["Admin", "Employee", "System"],
      required: true,
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    actorEmail: {
      type: String,
      default: null,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    module: {
      type: String,
      enum: [
        "AUTH",
        "EMPLOYEE",
        "DEPARTMENT",
        "TASK",
        "ATTENDANCE",
        "LEAVE",
        "HOLIDAY",
        "PAYROLL",
        "PAYSLIP",
        "SETTINGS",
        "ROLE",
      ],
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
