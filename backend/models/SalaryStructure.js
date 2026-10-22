const mongoose = require("mongoose");

const salaryStructureSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    // Configurable component breakdown (defaults derived from baseSalary if not explicitly overridden)
    basicPercent: {
      type: Number,
      default: 50, // 50% of baseSalary
    },
    hraPercent: {
      type: Number,
      default: 25, // 25% of baseSalary
    },
    daPercent: {
      type: Number,
      default: 10, // 10% of baseSalary
    },
    specialAllowancePercent: {
      type: Number,
      default: 15, // 15% of baseSalary
    },
    // Statutory & Policy Rules
    pfEnabled: {
      type: Boolean,
      default: false,
    },
    pfRatePercent: {
      type: Number,
      default: 12, // 12% of Basic
    },
    esiEnabled: {
      type: Boolean,
      default: false,
    },
    esiRatePercent: {
      type: Number,
      default: 0.75,
    },
    professionalTaxAmount: {
      type: Number,
      default: 0,
    },
    tdsRatePercent: {
      type: Number,
      default: 0,
    },
    overtimeEligible: {
      type: Boolean,
      default: true,
    },
    overtimeHourlyMultiplier: {
      type: Number,
      default: 1.5,
    },
    defaultMonthlyAdjustment: {
      type: Number,
      default: 0,
    },
    salaryBasis: {
      type: String,
      enum: ["WORKING_DAYS", "CALENDAR_DAYS", "FIXED_30_DAYS"],
      default: "WORKING_DAYS",
    },
    currency: {
      type: String,
      default: "INR",
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.SalaryStructure ||
  mongoose.model("SalaryStructure", salaryStructureSchema);
