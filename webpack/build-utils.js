const path = require('path');

const isMin = !!process.env.WEBPACK_BUILD_MIN;

const isLight = !!process.env.WEBPACK_BUILD_LIGHT;

const minFilenamePart = isMin ? '.min' : '';

const lightFilenamePart = isLight ? '.light' : '';

const getProfilesPathPattern = (outputPath) => ({
  from: path.resolve(outputPath, '../src/profiles'),
  to: path.resolve(outputPath, 'profiles')
});

module.exports = { isMin, isLight, minFilenamePart, lightFilenamePart, getProfilesPathPattern };
