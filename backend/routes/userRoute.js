const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const userController = require("../controllers/userController");

// Get all users (admin only)
router.get("/", auth, userController.getAllUsers);

// Get user by ID
router.get("/:id", auth, userController.getUserById);

// Create new user (admin only)
router.post("/", auth, userController.createUser);

// Update user (admin only or self)
router.put("/:id", auth, userController.updateUser);

// Delete user (admin only)
router.delete("/:id", auth, userController.deleteUser);

module.exports = router; 