const Membership = require('../models/Membership');
const User = require('../models/User');

// Helper function to generate a unique membership number
const generateMembershipNumber = async () => {
  const prefix = 'MEM';
  const date = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const membershipNumber = `${prefix}${date}${random}`;

  // Check if number already exists
  const existing = await Membership.findOne({ membershipNumber });
  if (existing) {
    return generateMembershipNumber(); // Recursively try again
  }

  return membershipNumber;
};

// Get all memberships
exports.getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find();
    
    // Enrich with user data
    const enrichedMemberships = await Promise.all(
      memberships.map(async (membership) => {
        try {
          const user = await User.findById(membership.userId).select('name email');
          return {
            ...membership.toObject(),
            user: user ? { name: user.name, email: user.email } : null
          };
        } catch (err) {
          console.error(`Error fetching user for membership ${membership._id}:`, err);
          return membership.toObject();
        }
      })
    );
    
    res.json(enrichedMemberships);
  } catch (error) {
    console.error('Error fetching memberships:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get membership by ID
exports.getMembershipById = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    
    if (!membership) {
      return res.status(404).json({ msg: 'Membership not found' });
    }
    
    // Get user data if available
    let userData = null;
    try {
      const user = await User.findById(membership.userId).select('name email');
      if (user) {
        userData = { name: user.name, email: user.email };
      }
    } catch (err) {
      console.error(`Error fetching user for membership ${membership._id}:`, err);
    }
    
    res.json({
      ...membership.toObject(),
      user: userData
    });
  } catch (error) {
    console.error('Error fetching membership:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get memberships by user ID
exports.getMembershipsByUserId = async (req, res) => {
  try {
    const memberships = await Membership.find({ userId: req.params.userId });
    
    if (memberships.length === 0) {
      return res.status(404).json({ msg: 'No memberships found for this user' });
    }
    
    res.json(memberships);
  } catch (error) {
    console.error('Error fetching user memberships:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Create new membership
exports.createMembership = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }
    
    const { userId, type, startDate, endDate, status } = req.body;
    
    // Validate required fields
    if (!userId || !type || !startDate || !endDate) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Generate unique membership number
    const membershipNumber = await generateMembershipNumber();
    
    const membership = new Membership({
      membershipNumber,
      userId,
      type,
      startDate,
      endDate,
      status: status || 'active'
    });
    
    await membership.save();
    
    // Return membership with user data
    res.status(201).json({
      ...membership.toObject(),
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Error creating membership:', error);
    res.status(500).json({ msg: error.message });
  }
};

// Update membership
exports.updateMembership = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }
    
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ msg: 'Membership not found' });
    }
    
    const { userId, type, startDate, endDate, status } = req.body;
    
    // Check if user exists if userId is provided
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      membership.userId = userId;
    }
    
    // Update fields if provided
    if (type) membership.type = type;
    if (startDate) membership.startDate = startDate;
    if (endDate) membership.endDate = endDate;
    if (status) membership.status = status;
    
    await membership.save();
    
    // Get user data
    let userData = null;
    try {
      const user = await User.findById(membership.userId).select('name email');
      if (user) {
        userData = { name: user.name, email: user.email };
      }
    } catch (err) {
      console.error(`Error fetching user for membership ${membership._id}:`, err);
    }
    
    res.json({
      ...membership.toObject(),
      user: userData
    });
  } catch (error) {
    console.error('Error updating membership:', error);
    res.status(500).json({ msg: error.message });
  }
};

// Delete membership
exports.deleteMembership = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }
    
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ msg: 'Membership not found' });
    }
    
    await Membership.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Membership removed' });
  } catch (error) {
    console.error('Error deleting membership:', error);
    res.status(500).json({ msg: error.message });
  }
};