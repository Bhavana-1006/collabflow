const express = require('express');
const router = express.Router();
const {
  getDocs,
  getDocById,
  createDoc,
  updateDoc,
  deleteDoc,
  getVersions,
  restoreVersion,
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getDocs)
  .post(createDoc);

router.route('/:documentId')
  .get(getDocById)
  .put(updateDoc)
  .delete(deleteDoc);

router.get('/:documentId/versions', getVersions);
router.post('/:documentId/restore/:versionId', restoreVersion);

module.exports = router;
