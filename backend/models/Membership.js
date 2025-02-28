const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  membershipNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    enum: ['6', '12', '24'],
    default: '6'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  }
});

module.exports = mongoose.model('Membership', MembershipSchema);