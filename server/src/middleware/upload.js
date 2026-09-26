const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Ensure upload folder exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

const uploadToStorage = async (file) => {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: 'auto',
        folder: 'collabflow',
      });
      // remove local file after cloudinary upload
      fs.unlink(file.path, () => {});
      return {
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes || file.size,
      };
    } catch (err) {
      console.warn('Cloudinary upload error, using local fallback:', err.message);
    }
  }

  // Local fallback url
  const relativeUrl = `/uploads/${path.basename(file.path)}`;
  return {
    url: relativeUrl,
    publicId: null,
    size: file.size,
  };
};

module.exports = { upload, uploadToStorage };
