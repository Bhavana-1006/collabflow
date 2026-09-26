const express = require('express');
const router = express.Router();
const {
  getComments,
  createComment,
  addReply,
  toggleResolve,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getComments)
  .post(createComment);

router.post('/:commentId/reply', addReply);
router.put('/:commentId/resolve', toggleResolve);
router.delete('/:commentId', deleteComment);

module.exports = router;
