const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const membershipController = require('../controllers/membershipController');
const { auth, admin } = require('../middleware/authmiddleware');

// Apply auth and admin middleware to all routes in this router
router.use(auth, admin);

// Admin user management routes
router.get('/users/with-memberships', userController.getAllUsersWithMemberships);
router.get('/users/:id', userController.getUserByIdAdmin);
router.put('/users/:id', userController.updateUserAdmin);

// Admin membership management routes
router.get('/memberships/pending', membershipController.getPendingApplications);
router.put('/memberships/process/:id', membershipController.processMembershipApplication);

module.exports = router; 