const MembershipType = require('../models/MembershipType');

// Get all active membership types
exports.getMembershipTypes = async (req, res) => {
  try {
    const membershipTypes = await MembershipType.find({ active: true });
    
    // If no membership types exist yet, create default ones
    if (membershipTypes.length === 0) {
      const defaultTypes = [
        {
          name: 'Standard',
          description: 'Basic membership with standard benefits',
          fee: 50,
          benefits: ['Access to library resources', 'Borrow up to 5 books', 'Online catalog access'],
          active: true
        },
        {
          name: 'Premium',
          description: 'Enhanced membership with additional benefits',
          fee: 100,
          benefits: ['Access to all library resources', 'Borrow up to 10 books', 'Priority reservations', 'Access to rare collections'],
          active: true
        }
      ];
      
      await MembershipType.insertMany(defaultTypes);
      return res.status(200).json(defaultTypes);
    }
    
    res.status(200).json(membershipTypes);
  } catch (error) {
    console.error('Error fetching membership types:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new membership type (admin only)
exports.createMembershipType = async (req, res) => {
  try {
    const { name, description, fee, benefits } = req.body;
    
    const newType = new MembershipType({
      name,
      description,
      fee,
      benefits: benefits || []
    });
    
    await newType.save();
    
    res.status(201).json(newType);
  } catch (error) {
    console.error('Error creating membership type:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};