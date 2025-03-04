const express = require("express");
const router = express.Router();
const { auth, admin } = require("../middleware/authmiddleware");
const bookController = require("../controllers/bookController");

// Get all books
router.get("/", bookController.getBooks);

// Search books
router.get("/search", bookController.searchBooks);

// Get book by ID
router.get("/:id", bookController.getBookById);

// Add new book (admin only)
router.post("/", auth, admin, bookController.addBook);

// Update book (admin only)
router.put("/:id", auth, admin, bookController.updateBook);

// Delete book (admin only)
router.delete("/:id", auth, admin, bookController.deleteBook);

module.exports = router;