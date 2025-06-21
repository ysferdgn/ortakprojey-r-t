const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @route   GET /api/conversations
// @desc    Get all conversations for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate({
        path: 'participants',
        select: 'name email profilePicture',
      })
      .populate({
        path: 'lastMessage',
        select: 'text sender read createdAt',
      })
      .sort({ updatedAt: -1 });

    // Filter out the logged-in user from participants list for frontend ease
    const formattedConversations = conversations.map(convo => {
      const otherParticipant = convo.participants.find(p => p._id.toString() !== req.user.id);
      return {
        ...convo.toObject(),
        otherParticipant: otherParticipant,
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/conversations/:conversationId/messages
// @desc    Get all messages for a specific conversation
// @access  Private
router.get('/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Check if the user is a participant of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ msg: 'User not authorized for this conversation' });
    }

    const messages = await Message.find({ conversationId })
      .populate({
        path: 'sender',
        select: 'name profilePicture',
      })
      .sort({ createdAt: 1 }); // Show oldest messages first

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/conversations
// @desc    Create a new conversation or get existing one
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ msg: 'otherUserId is required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, otherUserId] }
    }).populate('participants', 'name email profilePicture');

    if (conversation) {
      // Return existing conversation
      const otherParticipant = conversation.participants.find(p => p._id.toString() !== req.user.id);
      return res.json({
        ...conversation.toObject(),
        otherParticipant: otherParticipant,
      });
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [req.user.id, otherUserId]
    });

    await conversation.save();

    // Populate participants
    await conversation.populate('participants', 'name email profilePicture');

    const otherParticipant = conversation.participants.find(p => p._id.toString() !== req.user.id);

    res.json({
      ...conversation.toObject(),
      otherParticipant: otherParticipant,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/conversations/:conversationId/messages
// @desc    Send a message in a conversation
// @access  Private
router.post('/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ msg: 'Message text is required' });
    }

    // Check if the user is a participant of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ msg: 'User not authorized for this conversation' });
    }

    // Create new message
    const message = new Message({
      conversationId,
      sender: req.user.id,
      text: text.trim()
    });

    await message.save();

    // Update conversation's lastMessage and updatedAt
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate sender info
    await message.populate('sender', 'name profilePicture');

    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 