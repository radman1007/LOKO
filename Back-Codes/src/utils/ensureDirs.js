const fs = require('fs');
const path = require('path');
const config = require('../config');

const UPLOAD_SUBDIRS = ['imports', 'videos', 'podcasts', 'thumbnails'];

function ensureUploadDirs() {
  const base = path.resolve(config.upload.dir);
  if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
  for (const sub of UPLOAD_SUBDIRS) {
    const dir = path.join(base, sub);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

module.exports = { ensureUploadDirs, UPLOAD_SUBDIRS };
