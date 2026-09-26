const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateDirectChat,
  getMessages,
  sendMessage,
  reactToMessage,
  markAsRead,
  editMessage,
  deleteMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations/direct', getOrCreateDirectChat);

router.route('/:conversationId')
  .get(getMessages)
  .post(sendMessage);

router.put('/:conversationId/read', markAsRead);
router.post('/message/:messageId/react', reactToMessage);
router.put('/message/:messageId', editMessage);
router.delete('/message/:messageId', deleteMessage);

module.exports = router;
