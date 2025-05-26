const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../dist/cld-video-player.js');
const dest = path.resolve(__dirname, '../dist/cld-video-player.light.js');
const srcMin = path.resolve(__dirname, '../dist/cld-video-player.min.js');
const destMin = path.resolve(__dirname, '../dist/cld-video-player.light.min.js');
const warning = 'console.warn(\'[Cloudinary] The "light" video-player is deprecated and will be removed in a future release. The main player is now light by default. Please use that instead.\');\n';

fs.readFile(src, 'utf8', (err, data) => {
  if (err) throw err;
  fs.writeFile(dest, warning + data, 'utf8', (err) => {
    if (err) throw err;
    console.log('Light bundle created with deprecation warning.');
  });
}); 

fs.readFile(srcMin, 'utf8', (err, data) => {
  if (err) throw err;
  fs.writeFile(destMin, warning + data, 'utf8', (err) => {
    if (err) throw err;
    console.log('Light minified bundle created with deprecation warning.');
  });
}); 
