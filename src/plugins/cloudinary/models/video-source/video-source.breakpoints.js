/**
 * Breakpoint utility for responsive video resolution
 * Passes container width and DPR to Cloudinary for optimal video delivery
 */

const DEFAULT_DPR = 2.0;

/**
 * Validate and normalize DPR to 1.0, 1.5, or 2.0
 * @param {number} dpr - User-specified DPR value
 * @returns {number} Normalized DPR (1.0, 1.5, or 2.0)
 */
export const validateDpr = (dpr) => {
  const capped = (typeof dpr === 'number' && !isNaN(dpr) && dpr >= 1.0) ? Math.min(dpr, 2.0) : DEFAULT_DPR;
  return capped < 1.25 ? 1.0 : capped < 1.75 ? 1.5 : 2.0;
};

/**
 * Get breakpoint transformation for responsive video
 * @param {Object} params
 * @param {boolean} params.breakpointsEnabled - Whether breakpoints are enabled
 * @param {number} params.dpr - DPR value (already validated)
 * @returns {Object|null} Transformation with width, dpr, and crop
 */
export const getBreakpointTransformation = ({ breakpointsEnabled, dpr }) => {
  if (!breakpointsEnabled) return null;
  
  // Get player element from DOM
  const playerElement = document.querySelector('.cld-video-player, video.vjs-tech');
  const width = playerElement?.clientWidth;
  
  if (!width) return null;
  
  return {
    width,
    dpr,
    crop: 'limit'
  };
};
