const express = require("express");
const router = express.Router();
const { auth, admin } = require("../middleware/authmiddleware");
const membershipController = require("../controllers/membershipController");

// IMPORTANT: Place more specific routes BEFORE parameterized routes
// Get all memberships for the current logged-in user
router.get("/my", auth, membershipController.getUserMemberships);

// Get all memberships
router.get("/", auth, membershipController.getAllMemberships);

// Get membership by ID
router.get("/:id", auth, membershipController.getMembershipById);

// Create new membership (admin only)
router.post("/", auth, admin, membershipController.createMembership);

// Update membership (admin only)
router.put("/:id", auth, admin, membershipController.updateMembership);

// Delete membership (admin only)
router.delete("/:id", auth, admin, membershipController.deleteMembership);

// Route for applying for a membership
router.post('/apply', auth, membershipController.applyForMembership);

// Admin routes for managing applications
router.get('/pending', auth, admin, membershipController.getPendingApplications);
router.put('/process/:id', auth, admin, membershipController.processMembershipApplication);

module.exports = router;