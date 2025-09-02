const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  request_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
  sender_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message:     { type: String, required: true },
  // Keep the exact name 'timestamp' to match your client expectations from SQL:
  timestamp:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
