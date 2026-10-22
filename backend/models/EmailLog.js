const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    recipientName: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      required: true,
    },
    templateName: {
      type: String,
      enum: [
        "PAYSLIP_DELIVERY",
        "PASSWORD_RESET",
        "WELCOME_CREDENTIALS",
        "TASK_ASSIGNED",
        "ATTENDANCE_NOTIFICATION",
        "GENERIC",
      ],
      default: "GENERIC",
      index: true,
    },
    relatedEntityType: {
      type: String,
      default: null,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Sent", "Failed"],
      default: "Pending",
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    messageId: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.EmailLog || mongoose.model("EmailLog", emailLogSchema);
