const BloodRequest = require('../models/BloodRequest');
const ChatMessage = require('../models/ChatMessage');

// ✅ For showing all conversations a user is part of
exports.getConversations = async (req, res) => {
  const userId = req.user.id;
  try {
    const requests = await BloodRequest.find({
      status: 'approved',
      $or: [{ recipient_user_id: userId }, { assigned_donor_id: userId }]
    })
      .select('required_blood_group recipient_user_id assigned_donor_id')
      .populate({ path: 'recipient_user_id', select: 'full_name' })
      .populate({ path: 'assigned_donor_id', select: 'full_name' });

    const conversations = requests.map(r => ({
      id: r._id.toString(),
      required_blood_group: r.required_blood_group,
      recipient_name: r.recipient_user_id?.full_name,
      donor_name: r.assigned_donor_id?.full_name
    }));

    res.status(200).json(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ✅ For fetching messages in a chat room
exports.getChatHistory = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!requestId) return res.status(400).json({ message: 'Request ID is required' });

    const messages = await ChatMessage.find({ request_id: requestId })
      .sort({ createdAt: 1 }) // oldest to newest
      .populate('sender_id recipient_id', 'full_name email');

    res.json(messages);
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ message: 'Failed to fetch chat history.' });
  }
};
