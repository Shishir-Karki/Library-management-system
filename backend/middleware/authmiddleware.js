const jwt = require("jsonwebtoken");
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is valid but user not found' });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin middleware - make sure to use after auth middleware
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  if (!req.user.isAdmin && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// Combined auth and admin middleware
const authAdmin = async (req, res, next) => {
  try {
    // First authenticate
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by id
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ msg: 'User not found' });
      }
      
      // Check if admin
      if (user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ msg: 'Token has expired', expired: true });
      }
      
      return res.status(401).json({ msg: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Auth admin middleware error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { auth, admin, authAdmin };
