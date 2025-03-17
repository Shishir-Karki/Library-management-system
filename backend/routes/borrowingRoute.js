const express = require('express');
const router = express.Router();
const borrowingController = require('../controllers/borrowingController');
const { auth, admin } = require('../middleware/authmiddleware');

// User routes (require authentication)
router.post('/borrow', auth, borrowingController.borrowBook);
router.put('/return/:borrowingId', auth, borrowingController.returnBook);
router.get('/user', auth, borrowingController.getUserBorrowings);
router.put('/pay-fine/:borrowingId', auth, borrowingController.payFine);

// Admin routes
router.get('/all', auth, admin, borrowingController.getAllBorrowings);
router.put('/:borrowingId', auth, admin, borrowingController.updateBorrowing);

module.exports = router; 