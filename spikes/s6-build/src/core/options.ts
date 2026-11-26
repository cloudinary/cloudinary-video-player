// Fixture: the one typed options definition (core ring). Read by TypeScript 7
// (isolatedDeclarations) and by ts-json-schema-generator (its peer TypeScript 5.9; not bundled).

/** Skin color schemes. One source of truth for the type and the runtime check. */
export const SKINS = ['dark', 'light'] as const;

/** Skin color scheme. */
export type Skin = (typeof SKINS)[number];

/** When autoplay starts. */
export type AutoplayMode = 'always' | 'never' | 'on-scroll';

/** Chapters from a VTT file. */
export interface ChaptersOptions {
  /** URL of the chapters VTT file. */
  url: string;
}

/** Options of one player (fixture subset). */
export interface PlayerOptions {
  /** Cloudinary cloud name. */
  cloudName: string;
  /** Public ID of the video. */
  publicId?: string;
  /**
   * Skin color scheme.
   * @default "dark"
   */
  skin?: Skin;
  /**
   * Start volume, 0 to 1.
   * @minimum 0
   * @maximum 1
   * @default 1
   */
  volume?: number;
  /**
   * When autoplay starts.
   * @default "never"
   */
  autoplayMode?: AutoplayMode;
  /**
   * Start playback when the player scrolls into view.
   * @deprecated Use `autoplayMode: "on-scroll"`.
   * @default false
   */
  autoplayOnScroll?: boolean;
  /**
   * Playback rates in the rate menu.
   * @default [0.5, 1, 1.5, 2]
   */
  playbackRates?: number[];
  /** Chapters: `true` reads them from the video service. */
  chapters?: boolean | ChaptersOptions;
  /** Show the title bar. */
  title?: boolean;
  /** Called when the player is ready. Not in the schema (functions: "hide"). */
  onReady?: (player: unknown) => void;
}

/** Default skin (explicit type: isolatedDeclarations). */
export const DEFAULT_SKIN: Skin = 'dark';

/** Returns true when the value is a known skin. */
export function isSkin(value: unknown): value is Skin {
  return (SKINS as readonly unknown[]).includes(value);
}
