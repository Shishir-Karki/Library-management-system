const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { auth, admin } = require('../middleware/authmiddleware');

// Public routes
router.get('/', bookController.getBooks);
router.get('/categories', bookController.getCategories);
router.get('/:id', bookController.getBookById);

// Admin routes
router.post('/', auth, admin, bookController.createBook);
router.put('/:id', auth, admin, bookController.updateBook);
router.delete('/:id', auth, admin, bookController.deleteBook);

module.exports = router; 