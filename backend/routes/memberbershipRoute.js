const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const admin = require("../middleware/admin");
const membershipController = require("../controllers/membershipController");

// Get membership by number
router.get("/:membershipNumber", auth, membershipController.getMembership);

// Add new membership (admin only)
router.post("/", [auth, admin], membershipController.addMembership);

// Update membership (admin only)
router.put("/:membershipNumber", [auth, admin], membershipController.updateMembership);

module.exports = router;