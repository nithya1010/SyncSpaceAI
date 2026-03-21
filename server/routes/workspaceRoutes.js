const express = require('express');
const { createWorkspace, getUserWorkspaces } = require('../controllers/workspace');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Create Workspace
router.post('/', protect, createWorkspace);

// Get User Workspaces
router.get('/', protect, getUserWorkspaces);

module.exports = router;