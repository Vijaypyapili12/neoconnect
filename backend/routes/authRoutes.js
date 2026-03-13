const router = require("express").Router()
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: "User already exists" })

    const hashed = await bcrypt.hash(password, 10)
    const user = new User({ name, email, password: hashed, role })
    await user.save()

    res.status(201).json({ message: "User Created" })
  } catch (err) {
    res.status(500).json({ message: "Server error during registration", error: err.message })
  }
})

// Add this to your authRoutes.js
router.get("/managers", async (req, res) => {
  try {
    // Fetch users who have the role of "manager"
    const managers = await User.find({ role: "manager" }).select("name email _id");
    res.json(managers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching managers" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: "User not found" })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: "Invalid password" })

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Good practice to expire tokens
    )

    res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: "Server error during login", error: err.message })
  }
})

module.exports = router