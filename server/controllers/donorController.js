const Donor = require('../models/Donor');
const User = require('../models/User');

exports.searchDonors = async (req, res) => {
  const { bloodGroup, address } = req.query;
  const searcherId = req.user?.id;

  if (!bloodGroup) {
    return res.status(400).json({ message: 'Blood group query parameter is required.' });
  }

  try {
    const userFilter = { };
    if (address && address.trim()) {
      userFilter.address = { $regex: address.trim(), $options: 'i' }; // case-insensitive
    }

    // Find users that match address (if given)
    const users = await User.find(userFilter).select('_id');
    const userIds = users.map(u => u._id.toString());

    const donorFilter = {
      blood_group: bloodGroup,
      status: 'available'
    };

    if (userIds.length) donorFilter.user_id = { $in: userIds };
    if (searcherId) donorFilter.user_id = { ...(donorFilter.user_id || {}), $ne: searcherId };

    const donors = await Donor.find(donorFilter)
      .populate({ path: 'user_id', select: 'full_name address' });

    res.status(200).json(donors);
  } catch (err) {
    console.error('Error in searchDonors:', err);
    res.status(500).json({ message: 'Server error while searching for donors.' });
  }
};

exports.registerAsDonor = async (req, res) => {
  const userId = req.user.id;
  try {
    const existing = await Donor.findOne({ user_id: userId });
    if (existing) {
      return res.status(400).json({ message: 'You are already registered as a donor. Thank you!' });
    }

    const user = await User.findById(userId).select('blood_group');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await Donor.create({
      user_id: userId,
      blood_group: user.blood_group,
      status: 'available'
    });

    res.status(201).json({ message: 'Successfully registered as a donor!' });
  } catch (err) {
    console.error('Error in registerAsDonor:', err);
    res.status(500).json({ message: 'Server error while registering as donor.' });
  }
};

exports.getDonorProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const donor = await Donor.findOne({ user_id: userId });
    if (!donor) return res.status(404).json({ message: 'Donor profile not found. User has not registered as a donor.' });
    res.status(200).json(donor);
  } catch (err) {
    console.error('Error fetching donor profile:', err);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
};

exports.updateDonorStatus = async (req, res) => {
  const userId = req.user.id;
  const { newStatus } = req.body;
  if (!['available', 'unavailable'].includes(newStatus)) {
    return res.status(400).json({ message: "Invalid status provided. Must be 'available' or 'unavailable'." });
  }
  try {
    const updated = await Donor.findOneAndUpdate(
      { user_id: userId },
      { status: newStatus },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Could not find a donor profile for your account.' });
    res.status(200).json({ message: `Your donation status has been updated to '${newStatus}'.` });
  } catch (err) {
    console.error('Error updating donor status:', err);
    res.status(500).json({ message: 'Server error while updating status.' });
  }
};
