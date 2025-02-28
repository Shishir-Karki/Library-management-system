const Book = require('../models/Book');

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

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
    res.json(book);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    const { title, author, genre, available } = req.body;
    if (title) book.title = title;
    if (author) book.author = author;
    if (genre) book.genre = genre;
    if (available !== undefined) book.available = available;

    await book.save();
    res.json(book);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { serialNumber: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};