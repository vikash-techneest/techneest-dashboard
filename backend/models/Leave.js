const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
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
    leaveType: {
      type: String,
      enum: ["Casual Leave", "Sick Leave", "Earned Leave", "Unpaid Leave", "Maternity/Paternity"],
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    endDate: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 0.5,
    },
    isHalfDay: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
      required: [true, "Leave reason is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
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
    reviewComment: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Leave || mongoose.model("Leave", leaveSchema);
