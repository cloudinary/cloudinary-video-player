export const INTERACTION_AREA_LAYOUT_LOCAL_STORAGE_NAME = 'cld-ia-layout-state';

export const INTERACTION_AREAS_PREFIX = 'vp-ia';

export const INTERACTION_AREAS_CONTAINER_CLASS_NAME = 'interaction-areas-container';

export const INTERACTION_AREAS_TEMPLATE = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape',
  All: 'all',
  CENTER: 'center'
};

export const INTERACTION_AREAS_THEME = {
  PULSING: 'pulsing',
  SHADOWED: 'shadowed'
};

export const TEMPLATE_INTERACTION_AREAS_VTT = {
  [INTERACTION_AREAS_TEMPLATE.PORTRAIT]: 'https://res.cloudinary.com/prod/raw/upload/v1623772481/video-player/vtts/portrait.vtt',
  [INTERACTION_AREAS_TEMPLATE.LANDSCAPE]: 'https://res.cloudinary.com/prod/raw/upload/v1623772303/video-player/vtts/landscape.vtt',
  [INTERACTION_AREAS_TEMPLATE.All]: 'https://res.cloudinary.com/prod/raw/upload/v1623250266/video-player/vtts/all.vtt',
  [INTERACTION_AREAS_TEMPLATE.CENTER]: 'https://res.cloudinary.com/prod/raw/upload/v1623250265/video-player/vtts/center.vtt'
};

export const INTERACTION_AREA_HAND_ICON = 'https://res.cloudinary.com/prod/image/upload/v1626764643/video-player/interaction-area-hand.svg';

export const CLOSE_INTERACTION_AREA_LAYOUT_DELAY = 4500;

export const DEFAULT_INTERACTION_ARE_TRANSITION = 250;
