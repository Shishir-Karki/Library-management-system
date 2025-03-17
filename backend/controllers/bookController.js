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
    const { title, author, serialNumber, genre, description, publishedYear, quantity } = req.body;
    
    // Generate serial number if not provided
    const bookSerialNumber = serialNumber || `BOOK${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Check if a book with this serial number already exists
    const existingBook = await Book.findOne({ serialNumber: bookSerialNumber });
    if (existingBook) {
      return res.status(400).json({ 
        message: 'A book with this serial number already exists' 
      });
    }
    
    // Create new book
    const newBook = new Book({
      title,
      author,
      serialNumber: bookSerialNumber,
      genre,
      description,
      publishedYear,
      quantity: quantity || 1
    });
    
    // Save book
    const savedBook = await newBook.save();
    
    res.status(201).json({
      message: 'Book added successfully',
      book: savedBook
    });
  } catch (error) {
    console.error('Error adding book:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A book with this serial number already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
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