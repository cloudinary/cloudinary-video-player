const isMin = !!process.env.WEBPACK_BUILD_MIN;

const minFilenamePart = isMin ? '.min' : '';

module.exports = { isMin, minFilenamePart };
