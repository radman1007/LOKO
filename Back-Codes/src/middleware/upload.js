const fs = require('fs');
const multer = require('multer');
const path = require('path');
const config = require('../config');
const { ValidationError } = require('../utils/errors');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdir = file.fieldname === 'excel' ? 'imports'
      : file.mimetype.startsWith('video') ? 'videos' : 'podcasts';
    const dest = path.join(config.upload.dir, subdir);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

function fileFilter(allowedMimes) {
  return (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError(`File type ${file.mimetype} not allowed`));
    }
  };
}

const excelUpload = multer({
  storage,
  limits: { fileSize: config.upload.maxExcelSizeMb * 1024 * 1024 },
  fileFilter: fileFilter([
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ]),
});

const mediaUpload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSizeMb * 1024 * 1024 },
  fileFilter: fileFilter([
    'video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav',
  ]),
});

module.exports = { excelUpload, mediaUpload, ensureDir };
