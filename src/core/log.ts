/** Console output of the player, with one prefix so integrators can filter it. */
export const warn = (message: string): void => {
  console.warn(`[cloudinary-video-player] ${message}`);
};
