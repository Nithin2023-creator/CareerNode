const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  companyName: { type: String, required: false },
  hrName: { type: String, required: false },
  email: { type: String, required: true },
  role: { type: String, required: false },
  dynamicData: { type: Map, of: String },
  status: {
    type: String,
    enum: ['Pending', 'Sent', 'Failed', 'Invalid'],
    default: 'Pending',
  },
  failReason: { type: String, required: false },
  sentAt: { type: Date, required: false },
  personalizedSubject: { type: String, required: false },
  personalizedBody: { type: String, required: false },
});

const campaignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  templateSubject: { type: String, required: true },
  templateBody: { type: String, required: true },
  resumeUrl: { type: String, required: false },
  coverLetterUrl: { type: String, required: false },
  recipients: [recipientSchema],
  status: {
    type: String,
    enum: ['Draft', 'Sending', 'Paused', 'Stopped', 'Completed', 'Partially Failed'],
    default: 'Draft',
  },
  lastProcessedIndex: { type: Number, default: -1 },
  pausedAt: { type: Date },
  stoppedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
