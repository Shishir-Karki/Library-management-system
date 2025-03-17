const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

// Import middleware
const { auth, admin } = require('./middleware/authmiddleware');

const app = express();

// ✅ Allow CORS for any origin
app.use(cors());

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoute'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/memberships', require('./routes/membershipRoute'));
app.use('/api/membership-types', require('./routes/membershipTypeRoute'));

// Import routes
const userRoutes = require('./routes/userRoute');
const membershipRoutes = require('./routes/membershipRoute');
const adminRoutes = require('./routes/adminRoute');

// Use routes with appropriate prefixes
app.use('/api/users', userRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Handle preflight (OPTIONS) requests
app.options('*', cors());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Debug route registration
app._router.stack.forEach(function (r) {
  if (r.route && r.route.path) {
    console.log(`Route registered: ${Object.keys(r.route.methods)} ${r.route.path}`);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
