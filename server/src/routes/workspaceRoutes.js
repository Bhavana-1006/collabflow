const express = require('express');
const router = express.Router();
const {
  getMyWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  updateMemberRole,
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/auth');
const { checkWorkspaceRole } = require('../middleware/role');

router.use(protect);

router.route('/')
  .get(getMyWorkspaces)
  .post(createWorkspace);

router.route('/:workspaceId')
  .get(getWorkspaceById)
  .put(checkWorkspaceRole(['owner', 'admin']), updateWorkspace)
  .delete(deleteWorkspace);

router.route('/:workspaceId/members')
  .post(checkWorkspaceRole(['owner', 'admin']), inviteMember);

router.route('/:workspaceId/members/:userId')
  .delete(checkWorkspaceRole(['owner', 'admin']), removeMember);

router.route('/:workspaceId/members/:userId/role')
  .put(checkWorkspaceRole(['owner', 'admin']), updateMemberRole);

module.exports = router;
