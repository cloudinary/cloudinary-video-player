/**
 * Breakpoint utility functions for responsive video resolution selection
 * Based on container width and device pixel ratio (DPR)
 */

/**
 * Normalize DPR to allowed values (1.0, 1.5, or 2.0)
 * Rounds to nearest allowed value and caps at 2.0
 * @param {number} dpr - User-specified DPR
 * @returns {number} Normalized DPR (1.0, 1.5, or 2.0)
 */
export const normalizeDpr = (dpr) => {
  // Cap at 2.0 first
  const capped = Math.min(dpr, 2.0);
  
  // Round to nearest allowed value (1.0, 1.5, or 2.0)
  if (capped < 1.25) return 1.0;
  if (capped < 1.75) return 1.5;
  return 2.0;
};

/**
 * Calculate optimal video width based on container and DPR
 * @param {Object} params
 * @param {number} params.containerWidth - Container element width in pixels
 * @param {number} params.dpr - Normalized DPR (1.0, 1.5, or 2.0)
 * @param {number[]} params.renditions - Available rendition widths (sorted ascending)
 * @returns {Object} { width, height }
 */
export const calculateBreakpoint = ({
  containerWidth,
  dpr,
  renditions
}) => {
  // Calculate required width (DPR already normalized)
  const requiredWidth = Math.round(containerWidth * dpr);
  
  // Select smallest rendition >= requiredWidth, or largest if none found
  const selectedWidth = renditions.find(w => w >= requiredWidth) || renditions[renditions.length - 1];
  
  return {
    width: selectedWidth,
    height: null  // Let Cloudinary auto-calculate
  };
};

/**
 * Validate breakpoint configuration
 * @param {Object} config - Breakpoint config object
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateBreakpointConfig = (config) => {
  if (!config || typeof config !== 'object') {
    return { valid: false, error: 'Breakpoint config must be an object' };
  }
  
  if (config.dpr !== undefined) {
    if (typeof config.dpr !== 'number' || isNaN(config.dpr)) {
      return { valid: false, error: 'dpr must be a valid number' };
    }
    if (config.dpr < 1.0) {
      return { valid: false, error: 'dpr must be at least 1.0' };
    }
  }
  
  return { valid: true, error: null };
};

/**
 * Get container element for width measurement
 * Always uses parent element, with fallback to player element itself
 * @param {HTMLElement} playerElement - Video player element
 * @returns {HTMLElement|null} Container element or null if not found
 */
export const getContainerElement = (playerElement) => {
  if (!playerElement) {
    return null;
  }
  
  // Use parent element, fallback to player element itself
  return playerElement.parentElement || playerElement;
};
