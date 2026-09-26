const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:notificationId/read', markRead);
router.delete('/:notificationId', deleteNotification);

module.exports = router;
