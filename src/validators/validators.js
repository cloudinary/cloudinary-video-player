import { ADS_IN_PLAYLIST, AUTO_PLAY_MODE, FLOATING_TO } from '../video-player.const';
import {
  INTERACTION_AREAS_TEMPLATE,
  INTERACTION_AREAS_THEME
} from '../plugins/interaction-areas/interaction-areas.const';
import { ADAPTIVE_STREAMING_STRATEGY } from '../plugins/adaptive-streaming/abr-strategies';
import { validator } from './validators-types';

export const playerValidators = {
  videojsOptions: {
    loop: validator.isBoolean,
    controls: validator.isBoolean,
    autoplay: validator.isBoolean,
    autoplayMode: validator.isString(AUTO_PLAY_MODE),
    bigPlayButton: validator.isBoolean,
    playbackRates: validator.isArray,
    showLogo: validator.isBoolean,
    logoImageUrl: validator.isString,
    logoOnclickUrl: validator.isString,
    videoJS: validator.isPlainObject,
    maxTries: validator.isNumber,
    muted: validator.isBoolean,
    playsinline: validator.isBoolean,
    videoTimeout: validator.isNumber,
    preload: validator.isString,
    sourceTransformation: validator.isPlainObject,
    allowUsageReport: validator.isBoolean,
    interactionAreas: {
      theme: {
        template: validator.isString(INTERACTION_AREAS_THEME)
      },
      layout: {
        enable: validator.isBoolean,
        showAgain: validator.isBoolean
      }
    }
  },
  playerOptions: {
    debug: validator.isBoolean,
    queryParams: validator.isPlainObject,
    publicId: validator.isString,
    fluid: validator.isBoolean,
    withCredentials: validator.isBoolean,
    analytics: validator.isBoolean,
    cloudinaryAnalytics: validator.or(validator.isBoolean, validator.isPlainObject),
    hideContextMenu: validator.isBoolean,
    playedEventPercents: validator.isArrayOfNumbers,
    showJumpControls: validator.isBoolean,
    chaptersButton: validator.isBoolean,
    pictureInPictureToggle: validator.isBoolean,
    seekThumbnails: validator.isBoolean,
    aiHighlightsGraph: validator.isBoolean,
    floatingWhenNotVisible: validator.isString(FLOATING_TO),
    playedEventTimes: validator.isArray,
    playlistWidget: {
      direction: validator.isString,
      total: validator.isNumber
    },
    colors: {
      base: validator.isString,
      accent: validator.isString,
      text: validator.isString
    },
    ads: {
      adTagUrl: validator.isString,
      showCountdown: validator.isBoolean,
      adLabel: validator.isString,
      locale: validator.isString,
      prerollTimeout: validator.isNumber,
      postrollTimeout: validator.isNumber,
      adsInPlaylist: validator.isString(ADS_IN_PLAYLIST)
    },
    cloudinary: {
      autoShowRecommendations: validator.isBoolean,
      sourceTypes: validator.isArrayOfStrings,
      transformation: validator.isObject,
      fontFace: validator.isString,
      posterOptions: {
        publicId: validator.isString,
        transformation: validator.isObject
      }
    }
  }
};

export const sourceValidators = {
  raw_transformation: validator.isString,
  shoppable: validator.isPlainObject,
  chapters: validator.or(validator.isBoolean, validator.isPlainObject),
  visualSearch: validator.or(validator.isBoolean),
  title: validator.or(validator.isString, validator.isBoolean),
  description: validator.or(validator.isString, validator.isBoolean),
  interactionAreas: {
    enable: validator.isBoolean,
    template: validator.or(validator.isString(INTERACTION_AREAS_TEMPLATE), validator.isArray),
    vttUrl: validator.isString,
    onClick: validator.isFunction
  },
  textTracks: {
    options: {
      theme: validator.isString,
      fontFace: validator.isString,
      fontSize: validator.isString,
      gravity: validator.isString,
      box: validator.isPlainObject,
      style: validator.isPlainObject,
      wordHighlightStyle: validator.isPlainObject
    },
    captions: {
      label: validator.isString,
      language: validator.isString,
      default: validator.isBoolean,
      url: validator.isString,
      maxWords: validator.isNumber,
      wordHighlight: validator.isBoolean,
      timeOffset: validator.isNumber
    },
    subtitles: validator.isArrayOfObjects({
      label: validator.isString,
      language: validator.isString,
      default: validator.isBoolean,
      url: validator.isString,
      maxWords: validator.isNumber,
      wordHighlight: validator.isBoolean,
      timeOffset: validator.isNumber
    })
  },
  info: {
    title: validator.isString,
    subtitle: validator.isString,
    description: validator.isString
  },
  cloudinary: {
    sourceTypes: validator.isArrayOfStrings,
    transformation: validator.isObject
  },
  adaptiveStreaming: {
    strategy: validator.isString(ADAPTIVE_STREAMING_STRATEGY)
  }
};
