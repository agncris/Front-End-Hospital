const fs = require('fs');
const path = require('path');

const dirs = ['public', 'public/assets', 'dist'];

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});
