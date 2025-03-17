const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'BOOK' + Math.floor(100000 + Math.random() * 900000);
    }
  },
  genre: { type: String },
  available: { type: Boolean, default: true },
}, { timestamps: true });

BookSchema.pre('save', function(next) {
  if (!this.serialNumber) {
    this.serialNumber = 'BOOK' + Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

module.exports = mongoose.model("Book", BookSchema);
