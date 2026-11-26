import { OPTION_CHANGES, SECRETS } from './renames.js';
import type { InternalOptions, PlayerOptions } from './types.js';

/**
 * The debug report (FR-008): one message per unknown, removed or invalid option.
 * Load this module only in debug mode; normalization does not need it.
 */

/** A value check (the v4 validator primitives). */
export type Check = (value: unknown) => boolean;
/** A check, or checks per key of an object value. */
export type Spec = Check | { readonly [key: string]: Spec };

export const isNumber: Check = (value) => typeof value === 'number' && !Number.isNaN(value);
export const isString: Check = (value) => typeof value === 'string';
export const isBoolean: Check = (value) => typeof value === 'boolean';
export const isFunction: Check = (value) => typeof value === 'function';
export const isPlainObject: Check = (value) =>
  typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;
export const isArrayOfStrings: Check = (value) => Array.isArray(value) && value.every(isString);
export const isArrayOfNumbers: Check = (value) => Array.isArray(value) && value.every(isNumber);
export const isArrayOfObjects =
  (spec: Spec): Check =>
  (value) =>
    Array.isArray(value) && value.every((item) => isPlainObject(item) && invalidPaths(item, spec).length === 0);
export const or =
  (...checks: Check[]): Check =>
  (value) =>
    checks.some((check) => check(value));
export const oneOf =
  (...values: unknown[]): Check =>
  (value) =>
    values.includes(value);
const isHttpUrl: Check = (value) => isString(value) && /^https?:\/\//i.test(value as string);
const isTransformation: Check = or(isString, isPlainObject, isArrayOfObjects({}));

/** Paths of the invalid values in `value` (the v4 `isValidConfig`, which returned `paths.length === 0`). */
export function invalidPaths(value: unknown, spec: Spec, path = ''): string[] {
  if (typeof spec === 'function') return spec(value) ? [] : [path];
  if (!isPlainObject(value)) return [path];
  const object = value as Record<string, unknown>;
  return Object.keys(spec).flatMap((key) =>
    object[key] === undefined ? [] : invalidPaths(object[key], spec[key] as Spec, path ? `${path}.${key}` : key),
  );
}

const textTrack: Spec = {
  label: isString,
  language: isString,
  default: isBoolean,
  url: isString,
  maxWords: isNumber,
  wordHighlight: isBoolean,
  timeOffset: isNumber,
};
// A source object (`source`, `videoSources`, `recommendations`) is checked with the same table.
const source: Spec = (value) => isPlainObject(value) && invalidPaths(value, OPTION_SPECS).length === 0;

/** One check per option; `tsc` fails when an option of `types.ts` has none, or one is extra. */
const OPTION_SPECS: Readonly<Record<keyof PlayerOptions, Spec>> = {
  cloudName: isString,
  cloud_name: isString,
  secure: isBoolean,
  privateCdn: isBoolean,
  private_cdn: isBoolean,
  secureDistribution: isString,
  secure_distribution: isString,
  cname: isString,
  cdnSubdomain: isBoolean,
  cdn_subdomain: isBoolean,
  secureCdnSubdomain: isBoolean,
  secure_cdn_subdomain: isBoolean,
  useRootPath: isBoolean,
  use_root_path: isBoolean,
  urlSuffix: isString,
  url_suffix: isString,
  shorten: isBoolean,
  publicId: isString,
  source,
  cloudinaryConfig: isPlainObject,
  type: isString,
  resourceType: isString,
  transformation: isTransformation,
  sourceTransformation: isPlainObject,
  rawTransformation: isString,
  sourceTypes: isArrayOfStrings,
  breakpoints: isBoolean,
  maxDpr: isNumber,
  aspectRatio: isString,
  cropMode: oneOf('fill', 'pad', 'smart'),
  cropPadColor: isString,
  hdr: isBoolean,
  poster: isString,
  posterOptions: { publicId: isString, transformation: isTransformation, posterColor: isString },
  textTracks: {
    options: {
      theme: isString,
      fontFace: isString,
      fontSize: isString,
      gravity: oneOf('top', 'right', 'bottom', 'left', 'center', 'top-right', 'bottom-right', 'bottom-left', 'top-left'),
      box: { x: isString, y: isString, width: isString, height: isString },
      style: isPlainObject,
      wordHighlight: isBoolean,
      wordHighlightStyle: isPlainObject,
      maxWords: isNumber,
      timeOffset: isNumber,
    },
    captions: textTrack,
    subtitles: isArrayOfObjects(textTrack),
  },
  chapters: or(isBoolean, isString, isPlainObject),
  title: or(isString, isBoolean),
  description: or(isString, isBoolean),
  info: { title: isString, subtitle: isString, description: isString },
  download: isBoolean,
  recommendations: or(isFunction, (value) => Array.isArray(value) && value.every(source)),
  autoShowRecommendations: isBoolean,
  videoSources: (value) => Array.isArray(value) && value.every(source),
  queryParams: isPlainObject,
  withCredentials: isBoolean,
  adaptiveStreaming: { strategy: oneOf('fastStart', 'balanced', 'highQuality') },
  allowUsageReport: isBoolean,
  autoplay: isBoolean,
  autoplayMode: oneOf('always', 'on-scroll', 'never'),
  muted: isBoolean,
  loop: isBoolean,
  controls: isBoolean,
  playsinline: isBoolean,
  preload: oneOf('auto', 'metadata', 'none'),
  fluid: isBoolean,
  bigPlayButton: or(isBoolean, oneOf('init')),
  playbackRates: isArrayOfNumbers,
  skin: oneOf('dark', 'light'),
  colors: { base: isString, accent: isString, text: isString },
  fontFace: isString,
  showLogo: isBoolean,
  logoImageUrl: isHttpUrl,
  logoOnclickUrl: isHttpUrl,
  showJumpControls: isBoolean,
  pictureInPictureToggle: isBoolean,
  chaptersButton: isBoolean,
  seekThumbnails: isBoolean,
  aiHighlightsGraph: isBoolean,
  hideContextMenu: isBoolean,
  floatingWhenNotVisible: oneOf('left', 'right', 'none'),
  playlistWidget: {
    show: isBoolean,
    direction: oneOf('horizontal', 'vertical'),
    total: isNumber,
    selector: isString,
  },
  ads: {
    adTagUrl: isString,
    showCountdown: isBoolean,
    adLabel: isString,
    locale: isString,
    prerollTimeout: isNumber,
    postrollTimeout: isNumber,
    adsInPlaylist: oneOf('first-video', 'every-video'),
  },
  analytics: isBoolean,
  cloudinaryAnalytics: or(isBoolean, isPlainObject),
  playedEventPercents: isArrayOfNumbers,
  playedEventTimes: isArrayOfNumbers,
  profile: isString,
  videoConfig: isBoolean,
  lazy: or(isBoolean, (value) => isPlainObject(value) && invalidPaths(value, { loadOnScroll: isBoolean }).length === 0),
  schedule: { weekly: isArrayOfObjects({ day: isString, start: isString, duration: isNumber }) },
  debug: isBoolean,
  maxTries: isNumber,
  videoTimeout: isNumber,
  fetchErrorUsingGet: isBoolean,
};

const INTERNAL: Readonly<Record<keyof InternalOptions, true>> = { _internalAnalyticsMetadata: true };

/** The debug messages for one layer of raw options, in key order. Secrets warn elsewhere, in every mode. */
export function debugReport(raw: Record<string, unknown>): string[] {
  const messages: string[] = [];
  for (const [key, value] of Object.entries(raw)) {
    if (SECRETS.includes(key) || key in INTERNAL) continue;
    const change = OPTION_CHANGES[key];
    if (change?.note) {
      messages.push(
        change.to
          ? `Option "${key}" is renamed to "${change.to}": ${change.note}`
          : `Option "${key}" is removed: ${change.note}`,
      );
    }
    const name = change ? change.to : key;
    if (!name) {
      if (!change?.note) messages.push(`Unknown option "${key}": it is ignored.`);
      continue;
    }
    const spec = OPTION_SPECS[name as keyof PlayerOptions];
    if (!spec) {
      messages.push(`Unknown option "${key}": it is ignored.`);
      continue;
    }
    for (const path of invalidPaths(value, spec, key)) {
      messages.push(`Option "${path}" has an invalid value: ${JSON.stringify(valueAt(raw, path))}.`);
    }
  }
  return messages;
}

const valueAt = (object: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], object);
