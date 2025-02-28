const Membership = require('../models/Membership');

// Generate unique membership number
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

// Format date to YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const isStrongPassword = (password) => {
  return password.length >= 8 && // minimum length
    /[A-Z]/.test(password) && // has uppercase
    /[a-z]/.test(password) && // has lowercase
    /[0-9]/.test(password) && // has number
    /[^A-Za-z0-9]/.test(password); // has special char
};

// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Generate pagination metadata
const getPaginationMetadata = (total, limit, page) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

module.exports = {
  generateMembershipNumber,
  formatDate,
  isValidEmail,
  isStrongPassword,
  sanitizeInput,
  getPaginationMetadata
};