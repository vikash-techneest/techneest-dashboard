const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const documentSubSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["ID Proof", "Offer Letter", "Resume", "Certificate", "Contract", "Other"],
      default: "Other",
    },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, default: "application/octet-stream" },
    fileSize: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { _id: true }
);

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      index: true,
    },
    departmentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    role: {
      type: String,
      required: [true, "Job role / designation is required"],
      trim: true,
    },
    designation: {
      type: String,
      default: "",
      trim: true,
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
    baseSalary: {
      type: Number,
      required: [true, "Base salary is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
      index: true,
    },
    dailyPresenceStatus: {
      type: String,
      enum: ["Present", "Absent", "Late", "Half Day", "On Leave"],
      default: "Absent",
    },
    loginAccess: {
      type: String,
      enum: [
        "Email + temporary password",
        "SSO (Single Sign-On)",
        "Manual setup",
      ],
      default: "Email + temporary password",
    },
    attendancePolicy: {
      type: String,
      enum: ["Standard office hours", "Flexible hours", "Shift based"],
      default: "Standard office hours",
    },
    salaryCycle: {
      type: String,
      enum: ["Monthly - calendar month", "Bi-weekly", "Weekly"],
      default: "Monthly - calendar month",
    },
    permissions: {
      type: [String],
      default: [
        "self:profile:read",
        "self:profile:update",
        "self:attendance:mark",
        "self:attendance:read",
        "self:tasks:manage",
        "self:payslips:read",
      ],
    },
    documents: {
      type: [documentSubSchema],
      default: [],
    },
    attendanceSummary: {
      currentMonthPresentDays: { type: Number, default: 0 },
      currentMonthHalfDays: { type: Number, default: 0 },
      currentMonthLateDays: { type: Number, default: 0 },
      currentMonthLeaveDays: { type: Number, default: 0 },
      currentMonthHoursMinutes: { type: Number, default: 0 },
      totalWorkingDaysInMonth: { type: Number, default: 26 },
      lastUpdatedAt: { type: Date, default: null },
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastLoginIp: {
      type: String,
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

employeeSchema.pre("save", async function () {
  if (!this.designation && this.role) {
    this.designation = this.role;
  }
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    if (!this.isNew) {
      this.passwordChangedAt = new Date();
    }
  }
});

employeeSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

employeeSchema.methods.isLocked = function () {
  return Boolean(this.lockUntil && this.lockUntil > new Date());
};

employeeSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
