import type { QueryParams } from '../video-service.js';
import type { CloudConfig, Transformation } from '../options/types.js';

/** The adapter that plays a rendition: the browser itself, hls.js or dash.js. */
export type Engine = 'native' | 'hls' | 'dash';

/** One playable URL of a source (data-model §4). A source lists them in fallback order (FR-013). */
export interface Rendition {
  /** Identical to v4 for the same input (FR-011). */
  readonly url: string;
  /** The v4 MIME type, for example `video/mp4`, `application/x-mpegURL` or `video/auto`. */
  readonly mimeType: string;
  /** The v4 source type that gave this rendition, for example `auto`, `hls` or `webm/vp9`. */
  readonly sourceType: string;
  readonly engine: Engine;
}

/** Where the poster comes from (data-model §5). */
export type PosterOrigin = 'explicit' | 'saved' | 'image' | 'waveform';

export interface Poster {
  readonly url: string;
  readonly origin: PosterOrigin;
}

/** `audio` from `sourceTypes: ['audio']`, `raw-url` from an absolute URL. */
export type SourceKind = 'video' | 'audio' | 'raw-url';

/** A resolved source: immutable, and built from one `source()` call only (data-model §3, FR-009). */
export interface Source {
  readonly kind: SourceKind;
  /** Set for a Cloudinary asset; `url` is set for a raw URL. */
  readonly publicId?: string;
  readonly url?: string;
  /** Delivery type, for example `upload` or `private`. */
  readonly type: string;
  readonly resourceType: string;
  readonly cloud: CloudConfig;
  /** This source's transformation (with the player's), never a previous source's. */
  readonly transformation: Transformation | undefined;
  /** In order of preference. */
  readonly renditions: readonly Rendition[];
  readonly poster: Poster | null;
  readonly withCredentials: boolean;
  /** Query parameters of every media URL of this source (with `_s=vp` when the usage report is on). */
  readonly queryParams: QueryParams;
}
