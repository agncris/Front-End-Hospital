const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, 'dist');
const assetsDir = path.resolve(distDir, 'assets');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}
