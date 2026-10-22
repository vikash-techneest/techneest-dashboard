const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Holiday name is required"],
      trim: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, "Holiday date is required"],
      unique: true,
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
    type: {
      type: String,
      enum: ["National", "Festival", "Company", "Optional"],
      default: "Company",
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Holiday || mongoose.model("Holiday", holidaySchema);
