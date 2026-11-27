import type { Engine } from './types.js';

/** MIME type of a container or file extension (v4 `CONTAINER_MIME_TYPES`); others are `video/<name>`. */
const CONTAINER_MIME_TYPES: Readonly<Record<string, string>> = {
  hls: 'application/x-mpegURL',
  dash: 'application/dash+xml',
  opus: 'video/ogg',
  ogv: 'video/ogg',
  mp4: 'video/mp4',
  mov: 'video/mp4',
  m4v: 'video/mp4',
  mkv: 'video/x-matroska',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  aac: 'audio/aac',
  caf: 'audio/x-caf',
  flac: 'audio/flac',
  oga: 'audio/ogg',
  wav: 'audio/wav',
  m3u8: 'application/x-mpegURL',
  mpd: 'application/dash+xml',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

/** Video file extensions Cloudinary delivers (v4 `COMMON_VIDEO_EXTENSIONS`). */
export const VIDEO_EXTENSIONS: readonly string[] = [
  '3g2', '3gp', 'avi', 'flv', 'm3u8', 'ts', 'm2ts', 'mts', 'mov', 'mkv', 'mp4', 'mpeg', 'mpd', 'mxf', 'ogv', 'webm', 'wmv',
];

/** Codec names that make a transformation string "already has a codec" (v4 `VIDEO_CODEC`). */
const CODEC_NAMES = ['av1', 'vp9', 'hev1', 'h265', 'h264'];

/** URL format (file extension) of a source type container. */
const FORMATS: Readonly<Record<string, string>> = { hls: 'm3u8', dash: 'mpd' };

const ENGINES: Readonly<Record<string, Engine>> = { m3u8: 'hls', hls: 'hls', mpd: 'dash', dash: 'dash' };

/** A v4 source type such as `hls`, `webm/vp9` or `auto`, split into its parts. */
export interface SourceTypeParts {
  /** `webm` for `webm/vp9`. */
  readonly container: string;
  /** `vp9` for `webm/vp9`. */
  readonly codec: string | undefined;
  /** The URL extension: `m3u8` for `hls`, `mpd` for `dash`, else the container (`auto` adds none). */
  readonly format: string;
  readonly mimeType: string;
  readonly engine: Engine;
}

/** The MIME type of a container, format or file extension (v4). */
export function mimeTypeOf(container: string): string {
  return CONTAINER_MIME_TYPES[container] ?? `video/${container}`;
}

/** The engine that plays a container, format or file extension. */
export function engineOf(format: string): Engine {
  return ENGINES[format] ?? 'native';
}

/** Splits a v4 source type (`hls/h265`, `mp4`, `auto`); case-insensitive. */
export function parseSourceType(sourceType: string): SourceTypeParts {
  const [container = '', codec] = sourceType.toLowerCase().split('/');
  const format = FORMATS[container] ?? container;
  return { container, codec, format, mimeType: mimeTypeOf(container), engine: engineOf(format) };
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/**
 * The first value of `key` in a transformation: a step, a chain, or a step with a chained
 * `transformation` (v4 `getTransformationValue`). `undefined` when no step sets it.
 */
export function transformationValue(transformation: unknown, key: string): unknown {
  if (Array.isArray(transformation)) {
    for (const step of transformation) {
      const value = transformationValue(step, key);
      if (value) return value;
    }
    return undefined;
  }
  if (!isRecord(transformation)) return undefined;
  if (Array.isArray(transformation.transformation)) return transformationValue(transformation.transformation, key);
  return transformation[key];
}

/**
 * True when the transformation already picks a codec: a `video_codec` or `streaming_profile` key, or a
 * string that names a codec (v4 `hasCodec`). Then no codec is added from the source type.
 */
export function hasCodec(transformation: unknown): boolean {
  if (!transformation) return false;
  if (typeof transformation === 'string') return CODEC_NAMES.some((codec) => transformation.includes(codec));
  if (transformationValue(transformation, 'video_codec') || transformationValue(transformation, 'streaming_profile')) return true;
  return Array.isArray(transformation) && transformation.some(hasCodec);
}
