const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc Get all conversations for user in a workspace
// @route GET /api/messages/conversations?workspaceId=...
exports.getConversations = async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId is required' });
    }

    const conversations = await Conversation.find({
      workspace: workspaceId,
      $or: [
        { isChannel: true },
        { participants: req.user._id },
      ],
    })
      .populate('participants', 'name email avatar position status lastSeen')
      .populate('project', 'name color status')
      .sort({ updatedAt: -1 });

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get or create direct message conversation
// @route POST /api/messages/conversations/direct
exports.getOrCreateDirectChat = async (req, res) => {
  try {
    const { workspaceId, recipientId } = req.body;

    if (!workspaceId || !recipientId) {
      return res.status(400).json({ success: false, message: 'workspaceId and recipientId are required' });
    }

    let conv = await Conversation.findOne({
      workspace: workspaceId,
      type: 'direct',
      participants: { $all: [req.user._id, recipientId], $size: 2 },
    })
      .populate('participants', 'name email avatar position status lastSeen')
      .populate('project', 'name color');

    if (!conv) {
      const recipient = await User.findById(recipientId);
      conv = await Conversation.create({
        workspace: workspaceId,
        type: 'direct',
        participants: [req.user._id, recipientId],
        name: `${req.user.name} & ${recipient ? recipient.name : 'User'}`,
      });

      conv = await Conversation.findById(conv._id)
        .populate('participants', 'name email avatar position status lastSeen');
    }

    res.json({ success: true, conversation: conv });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get messages in a conversation
// @route GET /api/messages/:conversationId
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    const filter = { conversation: conversationId, isDeleted: false };
    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(filter)
      .populate('sender', 'name email avatar position status')
      .populate('replyTo')
      .populate('reactions.user', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit));

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Send message
// @route POST /api/messages/:conversationId
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, attachments, replyTo } = req.body;

    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const message = await Message.create({
      conversation: conversationId,
      workspace: conv.workspace,
      sender: req.user._id,
      text: text || '',
      attachments: attachments || [],
      replyTo: replyTo || null,
      readBy: [{ user: req.user._id, readAt: new Date() }],
    });

    // Update conversation last message timestamp
    conv.lastMessage = {
      text: text || (attachments && attachments.length ? '📎 Attachment' : ''),
      sender: req.user._id,
      createdAt: new Date(),
    };
    conv.updatedAt = new Date();
    await conv.save();

    const populatedMsg = await Message.findById(message._id)
      .populate('sender', 'name email avatar position status')
      .populate('replyTo');

    // Notify other participants in direct chat
    if (conv.type === 'direct') {
      const recipient = conv.participants.find(
        (p) => p.toString() !== req.user._id.toString()
      );
      if (recipient) {
        await Notification.create({
          recipient,
          sender: req.user._id,
          workspace: conv.workspace,
          type: 'new_message',
          title: `New message from ${req.user.name}`,
          message: text ? (text.length > 60 ? text.slice(0, 60) + '...' : text) : 'Sent an attachment',
          link: `/messages?conv=${conv._id}`,
        });
      }
    }

    res.status(201).json({ success: true, message: populatedMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc React to message
// @route POST /api/messages/:messageId/react
exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ success: false, message: 'Emoji is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      // Toggle off
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add reaction
      message.reactions.push({ user: req.user._id, emoji });
    }

    await message.save();

    const populatedMsg = await Message.findById(message._id)
      .populate('sender', 'name email avatar position')
      .populate('reactions.user', 'name avatar');

    res.json({ success: true, message: populatedMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Mark conversation messages as read
// @route PUT /api/messages/:conversationId/read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversation: conversationId,
        'readBy.user': { $ne: req.user._id },
      },
      {
        $push: { readBy: { user: req.user._id, readAt: new Date() } },
      }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Edit message
// @route PUT /api/messages/:messageId
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this message' });
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    const populatedMsg = await Message.findById(message._id)
      .populate('sender', 'name email avatar position')
      .populate('reactions.user', 'name avatar');

    res.json({ success: true, message: populatedMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete message
// @route DELETE /api/messages/:messageId
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
    }

    message.isDeleted = true;
    message.text = 'This message has been deleted.';
    await message.save();

    res.json({ success: true, messageId: message._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
