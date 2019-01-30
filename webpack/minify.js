// const UglifyJS = require('uglify-js');
const fs = require('fs');
const buildDir = './dist/';
const path = require('path');
const { execFile } = require('child_process');


const run = async () => {
  let files = fs.readdirSync(buildDir);
  files.map(file => {
    if (path.extname(file) === '.js' && !file.includes('.min.')) {
      let fileName = path.basename(file, '.js');
      execFile('./node_modules/uglify-js/bin/uglifyjs', ['--ie8', '-m', '-o', buildDir + fileName + '.min.js', buildDir + file], (error, stdout, stderr) => {
        if (error) {
          console.log(error);
          throw error;
        }
      });
    }
  });
};
run();