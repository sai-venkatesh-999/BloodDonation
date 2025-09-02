const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blood_group: String,
  availability_status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
  last_donation_date: Date
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);
