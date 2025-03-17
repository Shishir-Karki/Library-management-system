const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  membershipNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'expired', 'rejected', 'cancelled'],
    default: 'pending'
  },
  validUntil: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  }
}, { timestamps: true });

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;