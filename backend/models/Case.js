const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true
    },
    category: {
      type: String,
      required: true,
      enum: ["Safety", "Policy", "Facilities", "HR", "Other"] // Specific categories from the brief
    },
    department: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High"]
    },
    description: {
      type: String,
      required: true
    },
    anonymous: {
      type: Boolean,
      default: false
    },
    fileUrl: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ["New", "Assigned", "In Progress", "Pending", "Resolved", "Escalated"],
      default: "New"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    // Resolution fields for the Public Hub's Impact Tracking
    actionTaken: {
      type: String,
      default: ""
    },
    resultChanged: {
      type: String,
      default: ""
    }
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("Case", caseSchema);