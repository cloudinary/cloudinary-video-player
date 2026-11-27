import type { Transformation, TransformationStep } from '../options/types.js';
import { mediaUrl, type MediaAsset } from '../url/media-url.js';
import { transformationString } from '../url/transformation.js';
import type { QueryParams } from '../video-service.js';
import { VIDEO_EXTENSIONS, engineOf, hasCodec, mimeTypeOf, parseSourceType, transformationValue } from './codecs.js';
import type { Rendition } from './types.js';

/** What the renditions of a Cloudinary asset depend on. */
export interface RenditionSpec {
  readonly asset: MediaAsset;
  readonly transformation?: Transformation;
  /** Transformation per source type; it replaces `transformation` for that type. */
  readonly sourceTransformation?: Readonly<Record<string, Transformation>>;
  /** Added after everything else. */
  readonly rawTransformation?: string;
  readonly sourceTypes: readonly string[];
  /** `hdr` is on and the display supports HDR. */
  readonly hdr: boolean;
  /** A live stream: no `sp_auto`. */
  readonly live: boolean;
  readonly urlSuffix?: string;
  readonly query: QueryParams;
}

const HDR_STEP: TransformationStep = { fetch_format: 'mp4', video_codec: 'h265', raw_transformation: 'dr_high' };

/**
 * The transformation part of a rendition URL, nested as v4 did: the integrator's transformation
 * chained before the step the player adds (codec, format, streaming profile, HDR), and
 * `rawTransformation` last. Names join the added step (`f_auto:video,t_name`).
 */
const composeTransformation = (user: Transformation | undefined, added: TransformationStep, raw: string | undefined): string =>
  transformationString({ transformation: [{ ...added, transformation: user }], raw_transformation: raw });

/** One rendition of a Cloudinary asset for one source type (v4 `VideoSource.generateSources`). */
function assetRendition(spec: RenditionSpec, sourceType: string): Rendition {
  if (sourceType === 'audio') {
    // v4 AudioSource: an MP3 of the video asset, with the plain transformation
    const user = spec.sourceTransformation?.audio || spec.transformation;
    const url = mediaUrl({ ...spec.asset, resourceType: 'video' }, {
      transformation: composeTransformation(user, {}, spec.rawTransformation),
      format: 'mp3',
      query: spec.query,
    });
    return { url, mimeType: 'video/mp4', sourceType, engine: 'native' };
  }
  const parts = parseSourceType(sourceType || 'auto');
  const user = spec.sourceTransformation?.[sourceType] || spec.transformation;
  const added: Record<string, unknown> = {};
  let { mimeType } = parts;
  let format: string | undefined = parts.format;

  if (parts.codec && !hasCodec(user) && !hasCodec(spec.rawTransformation)) added.video_codec = parts.codec;
  if (format === 'auto') {
    format = undefined;
    const fetchFormat = transformationValue(user, 'fetch_format');
    // `format` is an alias of `fetch_format`
    const callerFormat = fetchFormat || transformationValue(user, 'format');
    if (typeof callerFormat === 'string' && !callerFormat.startsWith('auto')) {
      // Respect the integrator's format instead of adding f_auto:video
      if (!fetchFormat) added.fetch_format = callerFormat;
      mimeType = parseSourceType(callerFormat).mimeType;
    } else if (sourceType !== '') {
      // An empty source type delivers the asset as it is
      added.fetch_format = 'auto:video';
    }
  }
  const hasStreamingProfile = JSON.stringify(user ?? {}).includes('"streaming_profile":');
  if (parts.engine !== 'native' && !hasStreamingProfile && !spec.live) added.streaming_profile = 'auto';
  if (spec.hdr) Object.assign(added, HDR_STEP);

  const url = mediaUrl(spec.asset, {
    transformation: composeTransformation(user, added, spec.rawTransformation),
    format,
    urlSuffix: spec.urlSuffix,
    query: spec.query,
  });
  return { url, mimeType, sourceType, engine: parts.engine };
}

/** The renditions of a Cloudinary asset, one per source type, in the given order (FR-013). */
export function renditions(spec: RenditionSpec): Rendition[] {
  return spec.sourceTypes.map((sourceType) => assetRendition(spec, sourceType));
}

// The source type of a raw URL from its extension, else `auto` (v4 `generateRawSource`).
const extensionType = (url: string): string => {
  const extension = (url.split('.').pop() ?? '').split(/[?#]/)[0]?.toLowerCase() ?? '';
  return VIDEO_EXTENSIONS.includes(extension) ? extension : 'auto';
};

/**
 * The rendition of a raw media URL: the URL as it is (no query parameters), typed by the first
 * source type or else by its extension (v4). A raw URL has one rendition.
 */
export function rawUrlRenditions(url: string, sourceTypes: readonly string[]): Rendition[] {
  const given = sourceTypes[0];
  const sourceType = !given || given === 'auto' ? extensionType(url) : given;
  const { container } = parseSourceType(sourceType);
  return [{ url, mimeType: mimeTypeOf(container), sourceType, engine: engineOf(container) }];
}
