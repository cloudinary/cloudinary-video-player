import { cleanOptions, resolveCloudConfig, type NormalizedOptions, type RawOptions } from '../options/normalize.js';
import type { CloudConfig, PosterOptions, SourceOptions, Transformation, TransformationStep } from '../options/types.js';
import { isRawUrl, mediaUrl, queryParamsOf } from '../url/media-url.js';
import { transformationString } from '../url/transformation.js';
import { VIDEO_EXTENSIONS, transformationValue } from './codecs.js';
import { resolvePoster } from './poster.js';
import { rawUrlRenditions, renditions } from './renditions.js';
import type { Source, SourceKind } from './types.js';

/** Facts about the page that the URLs depend on; inputs, so the core stays pure. */
export interface Display {
  /** Player width in CSS pixels; unset before it is measured. */
  readonly width?: number;
  /** `devicePixelRatio`. */
  readonly dpr?: number;
  /** The display supports HDR (`(dynamic-range: high)`). */
  readonly hdr?: boolean;
}

const VIDEO_EXTENSION = new RegExp(`\\.(${VIDEO_EXTENSIONS.join('|')})$`);
const AUDIO_EXTENSION = /\.(mp3|ogg|wav|mp4)$/;
/** Widths `breakpoints` rounds up to (v4 `RENDITIONS`). */
const BREAKPOINT_WIDTHS = [640, 848, 1280, 1920, 2560, 3840];
const DEFAULT_DPR = 2;

const freezeAll = <T extends object>(items: T[]): readonly T[] => Object.freeze(items.map((item) => Object.freeze(item)));

/**
 * One source's media from its own options, as v4 `VideoSource`: renditions and poster, over `cloud`
 * (resolved delivery settings). No player defaults and no `_s=vp`: `buildSource` adds them.
 */
export function resolveSource(options: SourceOptions, cloud: CloudConfig, display: Display = {}): Source {
  const { publicId = '', type = 'upload', resourceType = 'video', sourceTypes = ['auto'], transformation } = options;
  const queryParams = Object.freeze(queryParamsOf(options.queryParams));
  const live = type === 'live';
  const raw = isRawUrl(publicId);
  const kind: SourceKind = raw ? 'raw-url' : sourceTypes.includes('audio') ? 'audio' : 'video';
  const id = raw ? undefined : publicId.replace(kind === 'audio' ? AUDIO_EXTENSION : VIDEO_EXTENSION, '');
  const asset = { cloud, publicId: id, resourceType, type };
  const sources = id === undefined
    ? rawUrlRenditions(publicId, sourceTypes)
    : renditions({
      asset: { ...asset, publicId: id },
      transformation,
      sourceTransformation: options.sourceTransformation,
      rawTransformation: options.rawTransformation,
      sourceTypes: kind === 'audio' ? ['audio'] : sourceTypes,
      hdr: options.hdr === true && display.hdr === true,
      live,
      urlSuffix: cloud.urlSuffix,
      query: queryParams,
    });
  const poster = resolvePoster({ kind, asset, poster: options.poster, posterOptions: options.posterOptions, live, query: queryParams });
  return Object.freeze({
    kind,
    ...(raw ? { url: publicId } : { publicId: id }),
    type,
    resourceType,
    cloud,
    transformation: transformation === undefined ? undefined : structuredClone(transformation),
    renditions: freezeAll(sources),
    poster: poster && Object.freeze(poster),
    withCredentials: options.withCredentials === true,
    queryParams,
  });
}

const isStep = (value: Transformation | undefined): value is TransformationStep =>
  typeof value === 'object' && !Array.isArray(value);
const stepsOf = (value: Transformation): Array<TransformationStep | string> => (Array.isArray(value) ? value : [value]);
const isEmpty = (value: Transformation | undefined): boolean =>
  value === undefined || (typeof value === 'object' && Object.keys(value).length === 0);

/** `over` on top of `base`: one step when both are one step (v4 `mergeTransformations`), else a chain. */
function mergeTransformation(base: Transformation | undefined, over: Transformation | undefined): Transformation | undefined {
  if (isEmpty(base)) return over;
  if (isEmpty(over)) return base;
  if (isStep(base) && isStep(over)) return { ...base, ...over };
  return [...stepsOf(base as Transformation), ...stepsOf(over as Transformation)];
}

// The `breakpoints`, `aspectRatio` and `cropMode` step (v4 `normalizeAspectCrop`).
function sizingStep(options: SourceOptions, display: Display, dpr: number): TransformationStep | undefined {
  const step: TransformationStep = {};
  if (options.breakpoints && display.width) {
    const required = display.width * dpr;
    step.width = BREAKPOINT_WIDTHS.find((width) => width >= required) ?? BREAKPOINT_WIDTHS.at(-1);
    if (!transformationValue(options.transformation, 'crop')) step.crop = 'limit';
  }
  if (options.aspectRatio) step.aspect_ratio = options.aspectRatio;
  if (options.cropMode === 'smart') Object.assign(step, { crop: 'fill', gravity: 'auto' });
  else if (options.cropMode) step.crop = options.cropMode;
  if (options.cropMode === 'pad' && options.cropPadColor) step.background = options.cropPadColor;
  return Object.keys(step).length > 0 ? step : undefined;
}

// Keys that a still image cannot take (v4 `omitVideoOnlyTransformations`); a poster keeps `f_auto`.
const VIDEO_ONLY_KEYS = ['streaming_profile', 'video_codec'];
const imageSafeStep = (step: TransformationStep, keepAutoFormat: boolean): TransformationStep =>
  Object.fromEntries(Object.entries(step).filter(([key, value]) =>
    !VIDEO_ONLY_KEYS.includes(key) && !((key === 'fetch_format' || key === 'format') && !(keepAutoFormat && value === 'auto'))));

// Named transformations are left out: their content is not known here.
function imageSafe(transformation: Transformation | undefined, keepAutoFormat: boolean): Transformation | undefined {
  if (transformation === undefined || typeof transformation === 'string') return undefined;
  if (!Array.isArray(transformation)) return imageSafeStep(transformation, keepAutoFormat);
  const steps = transformation.flatMap((step) => (typeof step === 'string' ? [] : [imageSafeStep(step, keepAutoFormat)]))
    .filter((step) => Object.keys(step).length > 0);
  return steps.length > 0 ? steps : undefined;
}

/**
 * The poster transformation (v4 `posterOptionsForCurrent`): `posterOptions.transformation`
 * (`c_scale` with a size), the player width rounded up to 100 px when the video has no width,
 * then the video's image-safe transformation.
 */
function posterTransformation(posterOptions: PosterOptions, video: Transformation | undefined, display: Display, dpr: number): Transformation | undefined {
  let poster = posterOptions.transformation;
  if (isStep(poster) && (poster.width || poster.height) && !poster.crop) poster = { ...poster, crop: 'scale' };
  if (!transformationValue(video, 'width') && display.width) {
    const width = 100 * Math.ceil((display.width * dpr) / 100);
    poster = mergeTransformation(poster, { width, ...(!transformationValue(poster, 'crop') && { crop: 'limit' }) });
  }
  poster = mergeTransformation(poster, imageSafe(video, true));
  if (isStep(poster) && poster.aspect_ratio) {
    const { height: _height, ...rest } = poster;
    poster = rest;
  }
  return poster;
}

/**
 * The one place where player options and source options merge (data-model §3). Pure: the result
 * depends only on the inputs, and nothing is shared with another call (FR-009). Adds, as the v4
 * player did: the player's transformation, `breakpoints`, `aspectRatio`/`cropMode`, the poster
 * transformation, `_s=vp` with `allowUsageReport`, and the saved poster by default (FR-038).
 */
export function buildSource(options: SourceOptions, player: NormalizedOptions, display: Display = {}): Source {
  const own = cleanOptions(options as RawOptions) as SourceOptions;
  const { cloud: playerCloud, ...playerOptions } = player;
  const merged: SourceOptions = { ...playerOptions, ...own };
  const cloud = resolveCloudConfig(own, playerCloud);
  const dpr = Math.min(merged.maxDpr ?? DEFAULT_DPR, display.dpr ?? DEFAULT_DPR, DEFAULT_DPR);
  const transformation = mergeTransformation(player.transformation,
    mergeTransformation(own.transformation, sizingStep({ ...merged, transformation: own.transformation }, display, dpr)));
  const posterOptions = { ...merged.posterOptions, transformation: posterTransformation(merged.posterOptions ?? {}, transformation, display, dpr) };
  // FR-038: a video asset gets its saved poster; a live stream has none (v4)
  const savedPoster = merged.poster === undefined && (merged.resourceType ?? 'video') === 'video'
    && merged.type !== 'live' && !isRawUrl(merged.publicId ?? '');
  return resolveSource({
    ...merged,
    transformation,
    posterOptions,
    poster: savedPoster ? true : merged.poster,
    queryParams: { ...merged.queryParams, ...(merged.allowUsageReport && { _s: 'vp' }) },
  }, cloud, display);
}

/**
 * The seek-thumbnail sprite (VTT) of a video source, as v4: the image-safe transformation, then
 * `fl_sprite` in its own step. `null` for audio, a live stream or a raw URL.
 */
export function thumbnailSpriteUrl(source: Source): string | null {
  const { kind, publicId, type } = source;
  if (kind !== 'video' || publicId === undefined || type === 'live') return null;
  const safe = imageSafe(source.transformation, false);
  const transformation = [safe && transformationString(safe), 'fl_sprite'].filter(Boolean).join('/');
  return mediaUrl({ ...source, publicId: `${publicId}.vtt` }, { transformation, query: source.queryParams });
}
