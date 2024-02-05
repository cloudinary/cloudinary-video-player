const isMin = !!process.env.WEBPACK_BUILD_MIN;

const isLight = !!process.env.WEBPACK_BUILD_LIGHT;

const minFilenamePart = isMin ? '.min' : '';

const lightFilenamePart = isLight ? '.light' : '';

module.exports = { isMin, isLight, minFilenamePart, lightFilenamePart };
