const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, admin } = require('../middleware/authmiddleware');

// Public routes
router.post('/login', userController.loginUser);

// Protected routes (logged in users)
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, userController.updateUserProfile);

// Admin routes
router.post('/', auth, admin, userController.registerUser);
router.get('/', auth, admin, userController.getUsers);
router.get('/:id', auth, admin, userController.getUserById);
router.put('/:id', auth, admin, userController.updateUser);
router.delete('/:id', auth, admin, userController.deleteUser);

module.exports = router; 