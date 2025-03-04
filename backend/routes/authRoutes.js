const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/authmiddleware");

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || "24h" 
  });
};

// Register User
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({ 
      name, 
      email, 
      password: await bcrypt.hash(password, 10) 
    });
    await user.save();

    const token = generateToken(user.id);
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user.id);
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get User Profile
router.get("/profile", auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Refresh Token
router.post("/refresh-token", auth, async (req, res) => {
  try {
    // User is already authenticated via the auth middleware
    const userId = req.user.id;
    
    // Generate a new token
    const newToken = generateToken(userId);
    
    res.json({ token: newToken });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Verify Token
router.get("/verify-token", auth, (req, res) => {
  // If we get here, the token is valid (auth middleware passed)
  res.status(200).json({ valid: true });
});

// Logout (optional - for server-side token invalidation if needed)
router.post("/logout", (req, res) => {
  // In a stateless JWT setup, the client simply discards the token
  // This endpoint could be used for server-side token blacklisting if implemented
  res.status(200).json({ msg: "Logged out successfully" });
});

module.exports = router;