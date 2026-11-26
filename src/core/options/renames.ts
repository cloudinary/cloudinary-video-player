/**
 * The one table of v4 option names that v5 converts or ignores (contracts/options.md, FR-010).
 * Local options, `<video>` attributes, saved profiles and per-asset configurations all go
 * through it, and the migration guide prints it.
 */

/**
 * One row. `to`: the v5 name (the value moves there). `note`: the debug message.
 * - `to` only: an accepted alias, converted without a message.
 * - `note` only: removed; the note names the replacement or the reason.
 * - neither: removed with the generic unknown-option message (it had no effect in v4).
 */
export interface OptionChange {
  to?: string;
  note?: string;
}

const DROPPED_FEATURE = 'the feature is not in v5.';
const VIDEOJS_8 = 'Video.js 10 takes no options object. Use `player.videojs` for advanced Video.js settings.';

export const OPTION_CHANGES: Readonly<Record<string, OptionChange>> = {
  // Aliases (Keep): v4 SDK snake_case names.
  cloud_name: { to: 'cloudName' },
  private_cdn: { to: 'privateCdn' },
  secure_distribution: { to: 'secureDistribution' },
  cdn_subdomain: { to: 'cdnSubdomain' },
  secure_cdn_subdomain: { to: 'secureCdnSubdomain' },
  use_root_path: { to: 'useRootPath' },
  url_suffix: { to: 'urlSuffix' },
  resource_type: { to: 'resourceType' },
  raw_transformation: { to: 'rawTransformation' },
  // Removed: dropped features (D-01).
  interactionAreas: { note: DROPPED_FEATURE },
  interactionDisplay: { note: DROPPED_FEATURE },
  shoppable: { note: DROPPED_FEATURE },
  // Removed: v4 internals and Video.js 8 options (contracts/options.md, D-30).
  contextMenu: { note: 'it was internal in v4. Use `hideContextMenu`.' },
  videojs: { note: VIDEOJS_8 },
  html5: { note: VIDEOJS_8 },
  textTrackSettings: {
    note: 'the caption settings dialog is not in 5.0 (planned for 5.x). Style captions with `textTracks.options`.',
  },
  disableSeekWhileScrubbingOnMobile: { note: 'Video.js 10 seeks while you drag on touch screens.' },
  videoJS: {},
  qualitySelector: {},
  ima: {},
};

/** Never used, in any mode or casing (FR-029): a console warning points to server-side signing. */
export const SECRETS: readonly string[] = ['api_secret', 'apiSecret', 'sign_url', 'signUrl', 'auth_token', 'authToken'];
