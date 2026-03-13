const mongoose = require("mongoose");

const meetingMinuteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      required: true // Required since the feature is an archive of meeting documents (PDFs)
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true } 
);

module.exports = mongoose.model("MeetingMinute", meetingMinuteSchema);