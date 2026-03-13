require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

// Import routes
const authRoutes = require("./routes/authRoutes")
const caseRoutes = require("./routes/caseRoutes")
const pollRoutes = require("./routes/pollRoutes")
const meetingMinuteRoutes = require("./routes/meetingMinuteRoutes")

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

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`)
})