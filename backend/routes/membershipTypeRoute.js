const express = require('express');
const router = express.Router();
const membershipTypeController = require('../controllers/membershipTypeController');
const { auth, admin } = require('../middleware/authmiddleware');

// Get all membership types (public)
router.get('/', membershipTypeController.getMembershipTypes);

// Create new membership type (admin only)
router.post('/', auth, admin, membershipTypeController.createMembershipType);

module.exports = router;