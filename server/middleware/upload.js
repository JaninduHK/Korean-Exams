const multer = require('multer');

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter for audio files only
const audioFileFilter = (req, file, cb) => {
  // Accept audio files only
  if (file.mimetype === 'audio/mpeg' ||
      file.mimetype === 'audio/mp3' ||
      file.mimetype === 'audio/wav' ||
      file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed (MP3, WAV)'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: audioFileFilter
});

// Middleware for single audio file upload
const uploadAudio = upload.single('audioFile');

// Error handling wrapper
const handleUploadError = (req, res, next) => {
  uploadAudio(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

module.exports = { uploadAudio: handleUploadError };
