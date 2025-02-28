const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const admin = require("../middleware/admin");
const bookController = require("../controllers/bookController");

// Get all books
router.get("/", bookController.getBooks);

// Search books
router.get("/search", bookController.searchBooks);

// Add new book (admin only)
router.post("/", [auth, admin], bookController.addBook);

// Update book (admin only)
router.put("/:id", [auth, admin], bookController.updateBook);

module.exports = router;