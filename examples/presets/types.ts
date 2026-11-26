import type { PlayerOptions } from 'cloudinary-video-player';

/** One player of a preset: the options a customer passes, and an optional call after creation. */
export interface PresetPlayer {
  options: PlayerOptions;
  source?: string;
  setup?: (player: unknown) => void;
}

/** A preset is data: `player.html?preset=<id>` renders it (test-plan.md §4). */
export interface Preset {
  id: string;
  title: string;
  feature: string;
  players: PresetPlayer[];
  /** `scroll` leaves room for lazy loading, autoplay on scroll and floating. */
  layout?: 'scroll';
}
