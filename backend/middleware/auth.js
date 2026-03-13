const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." })
  }

  const token = authHeader.split(" ")[1]

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    req.user = verified // { id, role, email }
    next()
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" })
  }
}

// This allows the specific role OR the "admin" role to access the route
const requireRole = (role) => {
  return (req, res, next) => {
    // If the user's role doesn't match the required role AND they aren't an admin, block them.
    if (req.user.role !== role && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: You do not have the required permissions." });
    }
    next(); // Otherwise, let them through!
  };
};

module.exports = { verifyToken, requireRole };