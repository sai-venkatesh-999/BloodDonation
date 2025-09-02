const BloodRequest = require('../models/BloodRequest');

exports.createRequest = async (req, res) => {
  const recipientUserId = req.user.id;
  const { requiredBloodGroup, hospitalName } = req.body;

  if (!requiredBloodGroup || !hospitalName) {
    return res.status(400).json({ message: 'Blood group and hospital name are required.' });
  }

  try {
    await BloodRequest.create({
      recipient_user_id: recipientUserId,
      required_blood_group: requiredBloodGroup,
      hospital_name: hospitalName,
      status: 'pending'
    });
    res.status(201).json({ message: 'Blood request created successfully. You can check its status on the "My Requests" page.' });
  } catch (err) {
    console.error('CREATE REQUEST ERROR:', err);
    res.status(500).json({ message: 'Server error while creating the request.' });
  }
};

exports.getMyRequests = async (req, res) => {
  const userId = req.user.id;
  try {
    const requests = await BloodRequest.find({ recipient_user_id: userId }).sort({ created_at: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error(`MY REQUESTS ERROR - Failed to fetch requests for user ${userId}:`, err);
    res.status(500).json({ message: 'Server error while fetching your requests.' });
  }
};
