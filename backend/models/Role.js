const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const DEFAULT_PERMISSIONS = [
  "dashboard:view",
  "employees:read",
  "employees:write",
  "employees:delete",
  "departments:read",
  "departments:write",
  "tasks:read",
  "tasks:write",
  "attendance:read",
  "attendance:approve",
  "attendance:adjust",
  "leaves:read",
  "leaves:approve",
  "holidays:manage",
  "payroll:read",
  "payroll:run",
  "payroll:approve",
  "payroll:finalize",
  "payslips:manage",
  "reports:view",
  "settings:manage",
  "roles:manage",
  "audit:read",
];

module.exports = {
  Role: mongoose.models.Role || mongoose.model("Role", roleSchema),
  DEFAULT_PERMISSIONS,
};
