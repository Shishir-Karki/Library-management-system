const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');
const User = require('../models/User');
const Membership = require('../models/Membership');

// Borrow a book
exports.borrowBook = async (req, res) => {
  try {
    const { bookId, dueDate } = req.body;
    const userId = req.user.id;
    
    // Validate book exists and has available copies
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    if (book.availableCopies < 1) {
      return res.status(400).json({ message: 'Book is not available for borrowing' });
    }
    
    // Validate user has active membership
    const user = await User.findById(userId).populate('membership');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.membership || user.membership.status !== 'active') {
      return res.status(403).json({ message: 'Active membership required to borrow books' });
    }
    
    // Check if user has reached borrowing limit
    const activeBorrowings = await Borrowing.countDocuments({ 
      user: userId, 
      status: { $in: ['borrowed', 'overdue'] } 
    });
    
    // Determine max books based on membership type (could be stored in membership model)
    let maxBooks = 3; // Default
    if (user.membership.type === 'Premium') {
      maxBooks = 5;
    } else if (user.membership.type === 'Standard') {
      maxBooks = 3;
    }
    
    if (activeBorrowings >= maxBooks) {
      return res.status(400).json({ 
        message: `You have reached your borrowing limit of ${maxBooks} books` 
      });
    }
    
    // Check if user already has this book
    const existingBorrowing = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: { $in: ['borrowed', 'overdue'] }
    });
    
    if (existingBorrowing) {
      return res.status(400).json({ message: 'You already have this book borrowed' });
    }
    
    // Calculate due date (if not provided)
    const borrowDate = new Date();
    let dueDateObj;
    
    if (dueDate) {
      dueDateObj = new Date(dueDate);
    } else {
      // Default to 14 days for borrowing period
      dueDateObj = new Date();
      dueDateObj.setDate(dueDateObj.getDate() + 14);
    }
    
    // Create borrowing record
    const borrowing = new Borrowing({
      book: bookId,
      user: userId,
      borrowDate,
      dueDate: dueDateObj,
      processedBy: req.user.isAdmin ? req.user.id : userId // If admin is processing, use admin ID
    });
    
    // Update book available copies
    book.availableCopies -= 1;
    
    // Save both records
    await Promise.all([
      borrowing.save(),
      book.save()
    ]);
    
    // Populate response data
    const populatedBorrowing = await Borrowing.findById(borrowing._id)
      .populate('book', 'title author isbn coverImage')
      .populate('user', 'name email');
    
    res.status(201).json({
      message: 'Book borrowed successfully',
      borrowing: populatedBorrowing
    });
  } catch (error) {
    console.error('Error in borrowBook:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Return a book
exports.returnBook = async (req, res) => {
  try {
    const { borrowingId } = req.params;
    
    // Find the borrowing record
    const borrowing = await Borrowing.findById(borrowingId)
      .populate('book')
      .populate('user');
    
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }
    
    // Check if book is already returned
    if (borrowing.status === 'returned') {
      return res.status(400).json({ message: 'Book is already returned' });
    }
    
    // Check if user is authorized (admin or the user who borrowed)
    if (!req.user.isAdmin && req.user.id.toString() !== borrowing.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to return this book' });
    }
    
    // Update borrowing record
    borrowing.returnDate = new Date();
    borrowing.status = 'returned';
    
    // Calculate fine if overdue
    const dueDate = new Date(borrowing.dueDate);
    const returnDate = new Date(borrowing.returnDate);
    
    if (returnDate > dueDate) {
      // Calculate days overdue
      const daysOverdue = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
      
      // Calculate fine ($0.50 per day)
      borrowing.fineAmount = daysOverdue * 0.5;
    }
    
    // Update book available copies
    borrowing.book.availableCopies += 1;
    
    // Save changes
    await Promise.all([
      borrowing.save(),
      borrowing.book.save()
    ]);
    
    res.status(200).json({
      message: 'Book returned successfully',
      borrowing
    });
  } catch (error) {
    console.error('Error in returnBook:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's borrowing history
exports.getUserBorrowings = async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.id;
    
    const query = { user: userId };
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    const borrowings = await Borrowing.find(query)
      .populate('book', 'title author isbn coverImage')
      .sort({ borrowDate: -1 });
    
    res.status(200).json(borrowings);
  } catch (error) {
    console.error('Error in getUserBorrowings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all borrowings (admin only)
exports.getAllBorrowings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      userId,
      bookId,
      overdue = false
    } = req.query;
    
    // Build query object
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (userId) {
      query.user = userId;
    }
    
    if (bookId) {
      query.book = bookId;
    }
    
    // Handle overdue filter
    if (overdue === 'true') {
      const today = new Date();
      query.dueDate = { $lt: today };
      query.status = 'borrowed';
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get paginated borrowings
    const borrowings = await Borrowing.find(query)
      .populate('book', 'title author isbn coverImage')
      .populate('user', 'name email')
      .populate('processedBy', 'name')
      .sort({ borrowDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Borrowing.countDocuments(query);
    
    res.status(200).json({
      borrowings,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error in getAllBorrowings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Pay fine
exports.payFine = async (req, res) => {
  try {
    const { borrowingId } = req.params;
    
    // Find the borrowing record
    const borrowing = await Borrowing.findById(borrowingId);
    
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }
    
    // Check if there's a fine to pay
    if (borrowing.fineAmount <= 0) {
      return res.status(400).json({ message: 'No fine to pay' });
    }
    
    // Check if fine is already paid
    if (borrowing.finePaid) {
      return res.status(400).json({ message: 'Fine is already paid' });
    }
    
    // Check if user is authorized (admin or the user who borrowed)
    if (!req.user.isAdmin && req.user.id.toString() !== borrowing.user.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay this fine' });
    }
    
    // Mark fine as paid
    borrowing.finePaid = true;
    await borrowing.save();
    
    res.status(200).json({
      message: 'Fine paid successfully',
      borrowing
    });
  } catch (error) {
    console.error('Error in payFine:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update borrowing (admin only)
exports.updateBorrowing = async (req, res) => {
  try {
    const { borrowingId } = req.params;
    const { status, dueDate, notes, fineAmount, finePaid } = req.body;
    
    // Find the borrowing record
    const borrowing = await Borrowing.findById(borrowingId);
    
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }
    
    // Update fields if provided
    if (status) borrowing.status = status;
    if (dueDate) borrowing.dueDate = new Date(dueDate);
    if (notes !== undefined) borrowing.notes = notes;
    if (fineAmount !== undefined) borrowing.fineAmount = fineAmount;
    if (finePaid !== undefined) borrowing.finePaid = finePaid;
    
    // If status changed to returned and returnDate not set, set it now
    if (status === 'returned' && !borrowing.returnDate) {
      borrowing.returnDate = new Date();
      
      // Also update book available copies if not already done
      const book = await Book.findById(borrowing.book);
      if (book) {
        book.availableCopies += 1;
        await book.save();
      }
    }
    
    // If changing from returned to borrowed, adjust book available copies
    if (borrowing.status === 'returned' && status === 'borrowed') {
      const book = await Book.findById(borrowing.book);
      if (book) {
        if (book.availableCopies < 1) {
          return res.status(400).json({ message: 'Book has no available copies' });
        }
        book.availableCopies -= 1;
        await book.save();
      }
      borrowing.returnDate = null;
    }
    
    await borrowing.save();
    
    // Return updated borrowing with populated references
    const updatedBorrowing = await Borrowing.findById(borrowingId)
      .populate('book', 'title author isbn coverImage')
      .populate('user', 'name email')
      .populate('processedBy', 'name');
    
    res.status(200).json(updatedBorrowing);
  } catch (error) {
    console.error('Error in updateBorrowing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 