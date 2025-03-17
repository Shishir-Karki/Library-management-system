const Membership = require('../models/Membership');
const User = require('../models/User');
const MembershipType = require('../models/MembershipType');
const mongoose = require('mongoose');

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

// Add this method to handle user memberships
exports.getUserMemberships = async (req, res) => {
  try {
    console.log('Fetching memberships for user:', req.user.id);
    
    // Find memberships where the user field matches the current user's ID
    const memberships = await Membership.find({ user: req.user.id });
    
    console.log('Found memberships:', memberships);
    res.status(200).json(memberships);
  } catch (error) {
    console.error('Error in getUserMemberships:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Apply for membership
exports.applyForMembership = async (req, res) => {
  try {
    const { type, duration } = req.body;
    
    // Get the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admins from applying
    if (user.isAdmin || user.role === 'admin') {
      return res.status(403).json({ 
        message: 'Administrators cannot apply for memberships'
      });
    }
    
    // Check if user already has an active or pending membership
    const existingMembership = await Membership.findOne({ 
      user: req.user.id,
      status: { $in: ['active', 'pending'] }
    });
    
    if (existingMembership) {
      return res.status(400).json({ 
        message: existingMembership.status === 'active' 
          ? 'You already have an active membership' 
          : 'You already have a pending membership application'
      });
    }
    
    // Verify membership type exists
    let membershipTypeData = {};
    try {
      const membershipType = await MembershipType.findById(type);
      if (!membershipType) {
        // If not found by ID, try looking up by name
        const typeByName = await MembershipType.findOne({ name: type });
        if (!typeByName) {
          return res.status(404).json({ message: 'Invalid membership type' });
        }
        membershipTypeData = typeByName;
      } else {
        membershipTypeData = membershipType;
      }
    } catch (error) {
      console.log('Error finding membership type:', error);
      // If the type doesn't exist or there's an error, use a default name
      membershipTypeData = { name: type };
    }
    
    // Generate a random membership number
    const membershipNumber = 'MEM' + Math.floor(10000 + Math.random() * 90000);
    
    // Calculate the validity period
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + parseInt(duration || 12));
    
    // Create a new membership
    const newMembership = new Membership({
      user: req.user.id,
      membershipNumber,
      type: membershipTypeData.name || type,
      status: 'pending', // Start with pending status until approved
      validUntil,
      notes: 'Applied online. Pending approval.'
    });
    
    console.log('Creating membership:', newMembership);
    
    const savedMembership = await newMembership.save();
    
    // Update the user with the membership reference
    user.membership = savedMembership._id;
    await user.save();
    
    res.status(201).json({
      message: 'Membership application submitted successfully',
      membership: savedMembership
    });
  } catch (error) {
    console.error('Error in applyForMembership:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending applications
exports.getPendingApplications = async (req, res) => {
  try {
    console.log('Fetching pending applications for admin');
    
    // Use the correct status field, not the ID
    const pendingMemberships = await Membership.find({ status: 'pending' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${pendingMemberships.length} pending applications`);
    
    return res.status(200).json(pendingMemberships);
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Approve or reject a membership application (admin only)
exports.processMembershipApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "active" or "rejected"' });
    }
    
    const membership = await Membership.findById(id);
    
    if (!membership) {
      return res.status(404).json({ message: 'Membership application not found' });
    }
    
    if (membership.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending applications can be processed' });
    }
    
    // Update the membership status
    membership.status = status;
    
    // Update notes based on new status
    if (status === 'active') {
      // If specific notes are provided, use them, otherwise set a default message
      membership.notes = notes || `Approved on ${new Date().toLocaleDateString()}. Membership is now active.`;
    } else if (status === 'rejected') {
      // If specific notes are provided, use them, otherwise set a default message
      membership.notes = notes || `Rejected on ${new Date().toLocaleDateString()}.`;
    }
    
    await membership.save();
    
    res.status(200).json({
      message: `Membership application ${status === 'active' ? 'approved' : 'rejected'}`,
      membership
    });
  } catch (error) {
    console.error('Error processing application:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};