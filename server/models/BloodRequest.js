const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  recipient_user_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  required_blood_group:{ type: String, required: true },
  hospital_name:       { type: String, required: true },
  status:              { type: String, enum: ['pending','approved','rejected','completed'], default: 'pending' },
  approved_by_admin_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assigned_donor_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
