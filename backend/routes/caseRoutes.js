const router = require("express").Router()
const Case = require("../models/Case")
const multer = require("multer")
const { verifyToken, requireRole } = require("../middleware/auth")

const upload = multer({ dest: "uploads/" })

async function generateTrackingId() {
  const year = new Date().getFullYear()
  const startOfYear = new Date(year, 0, 1)
  // Optimization: use lean() for faster read since we only need the count
  const count = await Case.countDocuments({ createdAt: { $gte: startOfYear } })
  
  const nextNum = String(count + 1).padStart(3, '0')
  return `NEO-${year}-${nextNum}` // [cite: 29]
}

router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const trackingId = await generateTrackingId()
    
    // Prevent mass assignment by picking only allowed fields
    const { category, department, location, severity, description, anonymous } = req.body
    
    const newCase = new Case({
      category, department, location, severity, description, anonymous,
      trackingId,
      fileUrl: req.file ? req.file.path : null
    })

    await newCase.save()
    res.status(201).json(newCase)
  } catch (err) {
    res.status(500).json({ message: "Error creating case", error: err.message })
  }
})

router.get("/", verifyToken, async (req, res) => {
  try {
    // Populate with specific fields for better performance
    const cases = await Case.find().populate("assignedTo", "name email").lean()
    res.json(cases)
  } catch (err) {
    res.status(500).json({ message: "Error fetching cases" })
  }
})

router.put("/assign/:id", verifyToken, requireRole("secretariat"), async (req, res) => {
  try {
    const { managerId } = req.body
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { assignedTo: managerId, status: "Assigned" },
      { new: true }
    )
    if (!updated) return res.status(404).json({ message: "Case not found" })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: "Error assigning case" })
  }
})

// Update case status (Case Manager only)
router.put("/status/:id", verifyToken, requireRole("manager"), async (req, res) => {
  try {
    const { status, actionTaken, resultChanged } = req.body
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { status, actionTaken, resultChanged }, // Save the resolution notes too!
      { new: true }
    )
    if (!updated) return res.status(404).json({ message: "Case not found" })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: "Error updating status" })
  }
})

module.exports = router