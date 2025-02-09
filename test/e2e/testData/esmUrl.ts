// On PR level it will use the preview deploy URL and locally it will use the latest EDGE.
export const ESM_URL = process.env.PREVIEW_URL ?? 'https://cld-vp-esm-pages.netlify.app/';
