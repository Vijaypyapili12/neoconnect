const router = require("express").Router()
const MeetingMinute = require("../models/MeetingMinute")
const multer = require("multer")
const { verifyToken, requireRole } = require("../middleware/auth")

// Setup multer specifically for PDFs
const upload = multer({ 
  dest: "uploads/minutes/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true)
    } else {
      cb(new Error("Only PDFs are allowed"))
    }
  }
})

// Upload a new meeting minute (Secretariat only)
router.post("/", verifyToken, requireRole("secretariat"), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "A PDF file is required" })
    }

    const { title } = req.body

    const newMinute = new MeetingMinute({
      title,
      fileUrl: req.file.path,
      uploadedBy: req.user.id
    })

    await newMinute.save()
    res.status(201).json(newMinute)
  } catch (err) {
    res.status(500).json({ message: "Error uploading meeting minutes", error: err.message })
  }
})

// Get all meeting minutes for the archive (Visible to all authenticated staff)
router.get("/", verifyToken, async (req, res) => {
  try {
    // Return sorted by newest first
    const minutes = await MeetingMinute.find()
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .lean()
      
    res.json(minutes)
  } catch (err) {
    res.status(500).json({ message: "Error fetching meeting minutes" })
  }
})

module.exports = router