const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  passwordHash: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
