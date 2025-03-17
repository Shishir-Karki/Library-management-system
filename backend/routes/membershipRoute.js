const express = require("express");
const router = express.Router();
const { auth, admin } = require("../middleware/authmiddleware");
const membershipController = require("../controllers/membershipController");

// IMPORTANT: Define a completely separate router for admin functionalities
// This avoids any conflicts with other routes
const adminRouter = express.Router();

// Admin routes with namespace
router.use('/admin', auth, admin, adminRouter);

// Admin-specific endpoints
adminRouter.get('/pending-applications', membershipController.getPendingApplications);
adminRouter.put('/process-application/:id', membershipController.processMembershipApplication);

// General user routes - MUST come after all non-parameterized routes
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

module.exports = router;