const mongoose = require("mongoose");

const adjustmentItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Bonus", "Incentive", "Allowance", "Deduction", "Reversal", "Adjustment"],
      required: true,
    },
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true }, // Positive for additions, negative for deductions
    reason: { type: String, default: "" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const payrollSchema = new mongoose.Schema(
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
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      index: true,
    },
    payPeriodLabel: {
      type: String, // e.g., "October 2026"
      required: true,
    },
    // Attendance & Leave Snapshot used for calculation
    attendanceBreakdown: {
      totalCalendarDays: { type: Number, default: 30 },
      totalWorkingDays: { type: Number, default: 26 },
      approvedPresentDays: { type: Number, default: 0 },
      approvedHalfDays: { type: Number, default: 0 },
      paidLeaveDays: { type: Number, default: 0 },
      unpaidLeaveDays: { type: Number, default: 0 },
      paidHolidays: { type: Number, default: 0 },
      unpaidAbsences: { type: Number, default: 0 },
      payableDays: { type: Number, default: 0 },
      overtimeHours: { type: Number, default: 0 },
    },
    // Monetary Breakdown (Decimal-safe INR amounts)
    baseSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    earnings: {
      basicEarned: { type: Number, default: 0 },
      hraEarned: { type: Number, default: 0 },
      daEarned: { type: Number, default: 0 },
      specialAllowanceEarned: { type: Number, default: 0 },
      overtimePay: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      incentives: { type: Number, default: 0 },
      positiveAdjustments: { type: Number, default: 0 },
      grossEarned: { type: Number, default: 0 },
    },
    deductions: {
      unpaidLeaveDeduction: { type: Number, default: 0 },
      pf: { type: Number, default: 0 },
      esi: { type: Number, default: 0 },
      professionalTax: { type: Number, default: 0 },
      tds: { type: Number, default: 0 },
      otherDeductions: { type: Number, default: 0 },
      totalDeductions: { type: Number, default: 0 },
    },
    netAdjustment: {
      type: Number, // Net adjustment displayed in SalaryManagement.jsx table
      default: 0,
    },
    adjustmentsList: {
      type: [adjustmentItemSchema],
      default: [],
    },
    netPayable: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    // Workflow Status (Separated from Payment Status as required by Section 9)
    workflowStatus: {
      type: String,
      enum: ["Draft", "Reviewed", "Approved", "Finalized", "Reversed"],
      default: "Draft",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Processing", "Paid", "Failed"],
      default: "Pending",
      index: true,
    },
    paymentReference: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "NEFT/RTGS", "UPI", "Cheque", "Manual", null],
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    // Immutable Snapshot preserved upon Finalization
    isImmutable: {
      type: Boolean,
      default: false,
    },
    immutableSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    finalizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    finalizedAt: {
      type: Date,
      default: null,
    },
    reversalReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate payroll records for the same employee and payroll period
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports =
  mongoose.models.Payroll || mongoose.model("Payroll", payrollSchema);
