const nodemailer = require('nodemailer');
const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

exports.getPendingRequests = async (req, res) => {
  try {
    const pending = await BloodRequest.find({ status: 'pending' })
      .sort({ created_at: 1 })
      .populate({ path: 'recipient_user_id', select: 'full_name email' });

    // shape like old SQL join
    const result = pending.map(br => ({
      id: br._id.toString(),
      required_blood_group: br.required_blood_group,
      hospital_name: br.hospital_name,
      status: br.status,
      created_at: br.created_at,
      recipient_name: br.recipient_user_id?.full_name,
      recipient_email: br.recipient_user_id?.email
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error('ADMIN DASHBOARD ERROR:', err);
    res.status(500).json({ message: 'Server error fetching requests.' });
  }
};

exports.approveRequest = async (req, res) => {
  const { id: requestId } = req.params;
  const adminId = req.user.id;

  try {
    const bloodRequest = await BloodRequest.findOne({ _id: requestId, status: 'pending' });
    if (!bloodRequest) {
      return res.status(404).json({ message: 'Request not found or has already been processed.' });
    }

    // find available donor (exclude recipient)
    const donor = await Donor.findOne({
      blood_group: bloodRequest.required_blood_group,
      status: 'available',
      user_id: { $ne: bloodRequest.recipient_user_id }
    });
    if (!donor) {
      return res.status(404).json({ message: `No available donors found for blood group ${bloodRequest.required_blood_group}. Cannot approve.` });
    }

    // recipient info
    const recipient = await User.findById(bloodRequest.recipient_user_id).select('email full_name');
    if (!recipient) throw new Error("Could not find the recipient user's details.");

    // update request
    bloodRequest.status = 'approved';
    bloodRequest.approved_by_admin_id = adminId;
    bloodRequest.assigned_donor_id = donor.user_id;
    await bloodRequest.save();

    // notify recipient
    await transporter.sendMail({
      from: `"LifeBlood App" <${process.env.EMAIL_USER}>`,
      to: recipient.email,
      subject: '✅ Your Blood Request has been Approved!',
      html: `<h3>Hello ${recipient.full_name},</h3>
             <p>Great news! Your blood request (ID: ${requestId}) has been approved and a donor has been assigned.</p>
             <p>Please log in to the app and go to the "My Chats" section to coordinate with the donor directly.</p>
             <br><p>Thank you,</p><p><b>The LifeBlood Team</b></p>`
    });

    res.status(200).json({ message: 'Request approved, donor assigned, and notification sent.' });
  } catch (err) {
    console.error(`--- ADMIN ACTION FAILED on Request ID ${requestId} ---`, err);
    res.status(500).json({ message: 'A server error occurred while approving the request.' });
  }
};

exports.rejectRequest = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;
  try {
    const updated = await BloodRequest.updateOne(
      { _id: id, status: 'pending' },
      { $set: { status: 'rejected', approved_by_admin_id: adminId } }
    );
    if (updated.modifiedCount === 0) {
      return res.status(404).json({ message: 'Request not found or has already been processed.' });
    }
    res.status(200).json({ message: 'Request rejected successfully.' });
  } catch (err) {
    console.error(`ADMIN ACTION ERROR - Failed to reject request ${id}:`, err);
    res.status(500).json({ message: 'Server error while rejecting the request.' });
  }
};
