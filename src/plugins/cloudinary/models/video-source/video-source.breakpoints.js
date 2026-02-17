
const DEFAULT_DPR = 2.0;
const RENDITIONS = [640, 1280, 1920, 3840];

export const roundedDpr = (value) => {
  const dprValue = value || DEFAULT_DPR;
  return [1, 1.5, 2].reduce((closest, option) => {
    return Math.abs(dprValue - option) < Math.abs(dprValue - closest)
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
