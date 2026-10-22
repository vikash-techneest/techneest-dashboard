const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const attachmentSubSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, default: "application/octet-stream" },
    fileSize: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    project: {
      type: String,
      required: [true, "Project / Category is required"],
      trim: true,
      index: true,
    },
    taskType: {
      type: String,
      enum: ["AdminAssigned", "Personal"],
      default: "AdminAssigned",
      index: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    assigneeName: {
      type: String,
      required: true,
      trim: true,
    },
    assigneeEmployeeId: {
      type: String,
      required: true,
      index: true,
    },
    assignedByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "Medium", "High", "Urgent"],
      default: "Normal",
      index: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Assigned", "To Do", "Pending", "In Progress", "Completed", "Done"],
      default: "Pending",
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notifyEmployee: {
      type: Boolean,
      default: true,
    },
    repeatTask: {
      type: String,
      enum: ["No repeat", "Daily", "Weekly", "Monthly"],
      default: "No repeat",
    },
    checklist: {
      type: [checklistItemSchema],
      default: [],
    },
    attachments: {
      type: [attachmentSubSchema],
      default: [],
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Task || mongoose.model("Task", taskSchema);
