const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled Resume'
  },
  mode: {
    type: String,
    enum: ['scratch', 'tailored'],
    required: true,
    default: 'scratch'
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Stores the complex nested resume object
    required: true,
    default: {}
  },
  jobDescription: {
    type: String,
  },
  atsScore: {
    type: mongoose.Schema.Types.Mixed, // { overall, breakdown, matchedKeywords, missingKeywords, suggestions, updatedAt }
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
