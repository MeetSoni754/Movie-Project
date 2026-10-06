const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["free", "premium"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Content", contentSchema);