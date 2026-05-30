const fs = require('fs');
const path = require('path');
const os = require('os');

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function writeTextFile(filePath, content, force, tracker) {
  ensureDirectory(path.dirname(filePath));

  if (fs.existsSync(filePath) && !force) {
    tracker.skipped.push(filePath);
    return;
  }

  fs.writeFileSync(filePath, content.replace(/\n/g, os.EOL), 'utf8');
  tracker.created.push(filePath);
}

function writeBinaryFile(filePath, buffer, force, tracker) {
  ensureDirectory(path.dirname(filePath));

  if (fs.existsSync(filePath) && !force) {
    tracker.skipped.push(filePath);
    return;
  }

  fs.writeFileSync(filePath, buffer);
  tracker.created.push(filePath);
}

function createTracker(targetDir) {
  return {
    targetDir,
    created: [],
    skipped: []
  };
}

function sanitizePackageName(input, fallback = 'scafkit-app') {
  const name = String(input || fallback)
    .trim()
    .toLowerCase()
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .pop()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return name || fallback;
}

module.exports = {
  ensureDirectory,
  writeTextFile,
  writeBinaryFile,
  createTracker,
  sanitizePackageName
};
