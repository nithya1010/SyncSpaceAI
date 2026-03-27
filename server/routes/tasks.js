const express = require('express');
const {
  createTask,
  getWorkspaceTasks,
  updateTask,
  deleteTask,
  getTaskStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, getTaskStats);
router.post('/:workspaceId', protect, createTask);
router.get('/:workspaceId', protect, getWorkspaceTasks);
router.put('/:taskId', protect, updateTask);
router.delete('/:taskId', protect, deleteTask);

module.exports = router;