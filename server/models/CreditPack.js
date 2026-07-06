const mongoose = require('mongoose');

const creditPackSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  credits: { type: Number, required: true },
  price: { type: Number, required: true },
  badge: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('CreditPack', creditPackSchema);
