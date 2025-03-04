const Book = require('../models/Book');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Add new book
// @route   POST /api/books
// @access  Admin
exports.addBook = async (req, res) => {
  try {
    const { title, author, genre, serialNumber, type } = req.body;
    
    // Check if serial number already exists
    const existingBook = await Book.findOne({ serialNumber });
    if (existingBook) {
      return res.status(400).json({ msg: 'Serial number already exists' });
    }

    const book = new Book({
      title,
      author,
      genre,
      serialNumber,
      type
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Admin
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    const { title, author, genre, serialNumber, type, available } = req.body;
    if (title) book.title = title;
    if (author) book.author = author;
    if (genre) book.genre = genre;
    if (serialNumber) book.serialNumber = serialNumber;
    if (type) book.type = type;
    if (available !== undefined) book.available = available;

    await book.save();
    res.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Admin
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    await Book.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Book removed' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Search books
// @route   GET /api/books/search
// @access  Public
exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }

    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { serialNumber: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(books);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ msg: error.message });
  }
};