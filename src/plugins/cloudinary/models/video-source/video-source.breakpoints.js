
const DEFAULT_DPR = 2.0;
const RENDITIONS = [640, 1280, 1920, 3840];

/**
 * Validate and normalize DPR to 1.0, 1.5, or 2.0
 * @param {number} dpr - User-specified DPR value
 * @returns {number} Normalized DPR (1.0, 1.5, or 2.0)
 */
export const validateDpr = (dpr) => {
  const capped = (typeof dpr === 'number' && !isNaN(dpr) && dpr >= 1.0) ? Math.min(dpr, 2.0) : DEFAULT_DPR;
  return [1, 1.5, 2].reduce((closest, option) => {
    return Math.abs(capped - option) < Math.abs(capped - closest)
      ? option
      : closest;
  });
};


export const getBreakpointTransformation = ({ breakpointsEnabled, dpr, playerWidth }) => {
  if (!breakpointsEnabled) return null;
  if (!playerWidth || typeof playerWidth !== 'number' || playerWidth <= 0) return null;
  
  // Round container width to nearest rendition (Cloudinary will handle DPR multiplication)
  const width = RENDITIONS.find(rendition => rendition >= playerWidth) || RENDITIONS[RENDITIONS.length - 1];
  
  return {
    width,
    dpr,
    crop: 'limit'
  };
};
