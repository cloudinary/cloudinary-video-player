const fs = require('fs');
const path = require('path');

const dist = path.resolve(__dirname, '../dist');

const warning = 'console.warn(\'[Cloudinary] The "light" video-player is deprecated and will be removed in a future release. The main player is now light by default. Please use that instead.\');\n';

const copies = [
  { src: 'player-full.js', dest: 'cld-video-player.light.js' },
  { src: 'player-full.min.js', dest: 'cld-video-player.light.min.js' }
];

copies.forEach(({ src, dest }) => {
  const srcPath = path.join(dist, src);
  const destPath = path.join(dist, dest);

  fs.readFile(srcPath, 'utf8', (err, data) => {
    if (err) throw err;
    fs.writeFile(destPath, warning + data, 'utf8', (err) => {
      if (err) throw err;
      console.log(`${dest} created (deprecated copy of ${src}).`);
    });
  });
});
