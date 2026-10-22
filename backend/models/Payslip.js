const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema(
  {
    payslipNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    payroll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payroll",
      required: true,
      unique: true,
      index: true,
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
    month: {
      type: Number,
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      default: "TechNeest",
    },
    employeeSnapshot: {
      fullName: { type: String, required: true },
      employeeId: { type: String, required: true },
      email: { type: String, required: true },
      department: { type: String, required: true },
      designation: { type: String, required: true },
      joiningDate: { type: String, default: "" },
    },
    salarySnapshot: {
      attendanceSummary: { type: mongoose.Schema.Types.Mixed, required: true },
      earnings: { type: mongoose.Schema.Types.Mixed, required: true },
      deductions: { type: mongoose.Schema.Types.Mixed, required: true },
      netPayable: { type: Number, required: true },
      currency: { type: String, default: "INR" },
    },
    filePath: {
      type: String, // Stored securely on disk, NOT publicly exposed
      required: true,
      select: false,
    },
    fileName: {
      type: String,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    emailDeliveryStatus: {
      type: String,
      enum: ["Pending", "Sent", "Failed", "Skipped_Unconfigured"],
      default: "Pending",
      index: true,
    },
    lastEmailAttemptAt: {
      type: Date,
      default: null,
    },
    emailRetryCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Payslip || mongoose.model("Payslip", payslipSchema);
