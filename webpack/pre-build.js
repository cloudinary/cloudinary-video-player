/**
 * Fix a line in video-js.scss that contains a wrong import path.
 * video-js.scss assumes that 'videojs-font' is located in a different location from what we have.
 */

const fs = require('fs');

/**
 * Replace an expression in a file
 * @param file
 * @param searchValue
 * @param newValue
 */
const replace = (file, searchValue, newValue) => {
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
      console.error(err);
      throw (err);
    }

    const result = data.replace(searchValue, newValue);

    fs.writeFile(file, result, 'utf8', function (err) {
      if (err) {
        console.error(err);
        throw (err);
      }
    });
  });
};


// Replace the wrong import path with the correct one
replace('node_modules/video.js/src/css/video-js.scss', '../../node_modules', '../../..');
