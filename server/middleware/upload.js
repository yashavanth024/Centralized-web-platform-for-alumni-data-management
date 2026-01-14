const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`
    );
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '')
    .split(',');

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter
});

module.exports = upload;
