const mongoose = require('mongoose');

const membershipTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  fee: {
    type: Number,
    required: true
  },
  benefits: [String],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const MembershipType = mongoose.model('MembershipType', membershipTypeSchema);

module.exports = MembershipType;