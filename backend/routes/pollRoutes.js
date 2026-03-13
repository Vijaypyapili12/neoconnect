const router = require("express").Router()
const Poll = require("../models/Poll")
const { verifyToken, requireRole } = require("../middleware/auth")

router.post("/", verifyToken, requireRole("secretariat"), async (req, res) => {
  try {
    const poll = new Poll(req.body) // [cite: 41]
    await poll.save()
    res.status(201).json(poll)
  } catch (error) {
    res.status(500).json({ message: "Error creating poll" })
  }
})

router.get("/", verifyToken, async (req, res) => {
  try {
    const polls = await Poll.find().lean()
    res.json(polls)
  } catch (error) {
    res.status(500).json({ message: "Error fetching polls" })
  }
})

router.post("/vote/:id", verifyToken, requireRole("staff"), async (req, res) => {
  try {
    const { option } = req.body
    const userId = req.user.id

    // Use atomic operators to prevent race conditions and improve performance
    const updatedPoll = await Poll.findOneAndUpdate(
      { 
        _id: req.params.id, 
        voters: { $ne: userId } // Only update if user is NOT in the voters array
      },
      { 
        $inc: { [`options.${option}.votes`]: 1 },
        $addToSet: { voters: userId } 
      },
      { new: true }
    )

    if (!updatedPoll) {
      return res.status(400).json({ message: "Poll not found or you have already voted" }) // [cite: 42]
    }

    res.json(updatedPoll)
  } catch (error) {
    res.status(500).json({ message: "Error recording vote", error: error.message })
  }
})

module.exports = router