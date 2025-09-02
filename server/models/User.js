const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  full_name:   { type: String, required: true },
  phone_number:{ type: String, required: true },
  address:     { type: String, required: true },
  blood_group: { type: String, required: true },
  role:        { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('User', userSchema);
