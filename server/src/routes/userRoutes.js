const express = require('express');
const router = express.Router();
const { searchUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/search', searchUsers);
router.get('/:userId', getUserById);

module.exports = router;
