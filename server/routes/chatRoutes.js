const express = require('express');
const router = express.Router();
const { getConversations, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/:requestId', protect, getChatHistory);

module.exports = router;
