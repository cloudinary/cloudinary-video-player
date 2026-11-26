// Every live Cloudinary asset the end-to-end tests use, and what it must have (test-plan.md §2).
export const assets = {
  seaTurtle: {
    cloudName: 'demo',
    publicId: 'sea_turtle',
    /** H.264 HLS ladder (avc1.640028), 270p–1080p. */
    hls: 'https://res.cloudinary.com/demo/video/upload/sp_auto/sea_turtle.m3u8',
  },
} as const;
