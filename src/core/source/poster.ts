import type { PosterOptions, SourceOptions, Transformation } from '../options/types.js';
import { isRawUrl, mediaUrl, type MediaAsset } from '../url/media-url.js';
import { transformationString } from '../url/transformation.js';
import { posterUrl, type QueryParams } from '../video-service.js';
import type { Poster, SourceKind } from './types.js';

/** What the poster of a source depends on. */
export interface PosterSpec {
  readonly kind: SourceKind;
  /** The source asset (its public ID is unset for a raw URL). */
  readonly asset: Omit<MediaAsset, 'publicId'> & { readonly publicId?: string };
  /** The `poster` option. `undefined`: the asset's still (v4 source level); `buildSource` passes `true` for FR-038. */
  readonly poster: SourceOptions['poster'];
  readonly posterOptions?: PosterOptions;
  readonly live: boolean;
  /** Query parameters of the source. */
  readonly query: QueryParams;
}

const txOf = (transformation: Transformation | undefined): string => (transformation ? transformationString(transformation) : '');

/** An image poster: resource type `image`, the source's delivery type (v4). */
function imagePoster(spec: PosterSpec, publicId: string, transformation?: Transformation): string {
  if (isRawUrl(publicId)) return publicId;
  const { cloud, type } = spec.asset;
  return mediaUrl({ cloud, publicId, resourceType: 'image', type }, { transformation: txOf(transformation), query: spec.query });
}

/**
 * The poster of a source (data-model §5): the `poster` option first, then `posterOptions.publicId`
 * (an image), then the asset's own poster: the waveform for audio, the saved poster for `poster: true`
 * (the video-service URL, FR-038), else the still of the asset (v4 `.jpg`). A live stream and a raw
 * URL have no poster of their own.
 */
export function resolvePoster(spec: PosterSpec): Poster | null {
  const { poster, posterOptions = {}, query } = spec;
  if (poster === false) return null;
  if (typeof poster === 'string') return { url: imagePoster(spec, poster), origin: 'explicit' };
  if (typeof poster === 'object') return { url: imagePoster(spec, poster.publicId, poster.transformation), origin: 'explicit' };
  if (posterOptions.publicId) return { url: imagePoster(spec, posterOptions.publicId, posterOptions.transformation), origin: 'image' };
  const { publicId } = spec.asset;
  if (publicId === undefined || (spec.live && poster === undefined)) return null;
  const asset = { ...spec.asset, publicId };

  const transformation = txOf(posterOptions.transformation);
  if (spec.kind === 'audio') {
    const url = mediaUrl({ ...asset, resourceType: 'video' }, { transformation: 'fl_waveform', format: 'jpg' });
    return { url, origin: 'waveform' };
  }
  if (poster === true) {
    return { url: posterUrl(asset, { ...(transformation && { tx: transformation }), ...query }), origin: 'saved' };
  }
  return { url: mediaUrl(asset, { transformation, format: 'jpg', query }), origin: 'image' };
}
