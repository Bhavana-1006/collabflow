const User = require('../models/User');

// @desc Search users by name or email
// @route GET /api/users/search?q=...
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('name email avatar position skills status lastSeen')
      .limit(20);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get user profile by ID
// @route GET /api/users/:userId
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name email avatar bio position skills status lastSeen');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
