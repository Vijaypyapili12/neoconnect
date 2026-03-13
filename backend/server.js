require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cron = require("node-cron") // Import node-cron

// Import routes
const authRoutes = require("./routes/authRoutes")
const caseRoutes = require("./routes/caseRoutes")
const pollRoutes = require("./routes/pollRoutes")
const meetingMinuteRoutes = require("./routes/meetingMinuteRoutes")

// Import Case model for the cron job (Verify this path matches your folder structure!)
const Case = require("./models/Case") 

const app = express()

app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err))

// Mount routes
app.use("/api/auth", authRoutes)
app.use("/api/cases", caseRoutes)
app.use("/api/polls", pollRoutes)
app.use("/api/minutes", meetingMinuteRoutes)

// --- 7-Day Auto-Escalation Cron Job ---
// This standard schedule ("0 0 * * *") runs exactly at midnight every day
cron.schedule("0 0 * * *", async () => {
  console.log("Running 7-day escalation check...");
  
  // Calculate the exact date and time 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    // Find cases that are older than 7 days AND are not already resolved or escalated
    const result = await Case.updateMany(
      {
        status: { $nin: ["Resolved", "Escalated"] }, 
        createdAt: { $lte: sevenDaysAgo }
      },
      { 
        $set: { status: "Escalated" } 
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`[Escalation Alert] ${result.modifiedCount} cases automatically escalated to Management.`);
    } else {
      console.log("[Escalation] System checked. No cases required escalation today.");
    }
  } catch (err) {
    console.error("Escalation Job Error:", err);
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`)
})