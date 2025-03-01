const User = require("../models/User");
const bcrypt = require('bcryptjs');

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    // Check if user is admin or requesting their own data
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ msg: 'Access denied. You can only view your own profile.' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }

    const { name, email, password, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please provide name, email and password' });
    }
    
    // Check if email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: role || 'user'
    });

    await user.save();
    
    // Return user without password
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ msg: error.message });
  }
};

// Update user (admin only or self)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is admin or updating their own profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ msg: 'Access denied. You can only update your own profile.' });
    }

    // Find user
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const { name, email, password, role } = req.body;
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) {
      // Check if new email already exists (for a different user)
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use by another user' });
      }
      user.email = email;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    
    // Only admin can change roles
    if (role && req.user.role === 'admin') {
      user.role = role;
    }

    await user.save();
    
    // Return user without password
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ msg: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Prevent deleting yourself
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ msg: 'You cannot delete your own account' });
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ msg: 'User removed' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ msg: error.message });
  }
};
