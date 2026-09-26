const express = require('express');
const router = express.Router();
const { uploadFile, getFiles, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);

router.get('/', getFiles);
router.post('/upload', upload.single('file'), uploadFile);
router.delete('/:fileId', deleteFile);

module.exports = router;
