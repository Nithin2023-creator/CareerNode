const mongoose = require('mongoose');

const logLineSchema = new mongoose.Schema({
  ts: { type: Date, default: Date.now },
  message: { type: String, required: true },
}, { _id: false });

const scrapeRunSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },
  companyName: { type: String, required: true },
  trigger: { type: String, enum: ['manual', 'scheduled'], required: true },
  status: { type: String, enum: ['running', 'success', 'failed'], default: 'running', index: true },
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date, default: null },
  stats: { type: mongoose.Schema.Types.Mixed, default: null },
  error: { type: String, default: null },
  linkAudit: { type: mongoose.Schema.Types.Mixed, default: null },
  // Persisted at completion only (live tailing while running is served from the
  // in-memory scrapeLogBus) - keeps this cheap to write.
  logs: { type: [logLineSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('ScrapeRun', scrapeRunSchema);
