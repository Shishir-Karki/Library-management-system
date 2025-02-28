const Membership = require('../models/Membership');
const { generateMembershipNumber } = require('../utils/helpers');

exports.addMembership = async (req, res) => {
  try {
    const { name, email, duration } = req.body;
    
    // Generate unique membership number
    const membershipNumber = await generateMembershipNumber();
    
    // Calculate end date based on duration
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(duration));

    const membership = new Membership({
      membershipNumber,
      name,
      email,
      duration,
      startDate,
      endDate
    });

    await membership.save();
    res.json(membership);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateMembership = async (req, res) => {
  try {
    const { duration, status } = req.body;
    const membership = await Membership.findOne({ 
      membershipNumber: req.params.membershipNumber 
    });

    if (!membership) {
      return res.status(404).json({ msg: 'Membership not found' });
    }

    if (duration) {
      const newEndDate = new Date();
      newEndDate.setMonth(newEndDate.getMonth() + parseInt(duration));
      membership.endDate = newEndDate;
      membership.duration = duration;
    }

    if (status) {
      membership.status = status;
    }

    await membership.save();
    res.json(membership);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getMembership = async (req, res) => {
  try {
    const membership = await Membership.findOne({ 
      membershipNumber: req.params.membershipNumber 
    });
    
    if (!membership) {
      return res.status(404).json({ msg: 'Membership not found' });
    }
    
    res.json(membership);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};