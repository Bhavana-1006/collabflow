const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  addSubtask,
  toggleSubtask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:taskId')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.put('/:taskId/move', moveTask);
router.post('/:taskId/subtasks', addSubtask);
router.put('/:taskId/subtasks/:subtaskId/toggle', toggleSubtask);

module.exports = router;
