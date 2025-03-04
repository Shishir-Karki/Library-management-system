const express = require("express");
const router = express.Router();
const { auth, admin } = require("../middleware/authmiddleware");
const membershipController = require("../controllers/membershipController");

// Get all memberships
router.get("/", auth, membershipController.getAllMemberships);

// Get membership by ID
router.get("/:id", auth, membershipController.getMembershipById);

// Get memberships by user ID
router.get("/user/:userId", auth, membershipController.getMembershipsByUserId);

// Create new membership (admin only)
router.post("/", auth, admin, membershipController.createMembership);

// Update membership (admin only)
router.put("/:id", auth, admin, membershipController.updateMembership);

// Delete membership (admin only)
router.delete("/:id", auth, admin, membershipController.deleteMembership);

module.exports = router;