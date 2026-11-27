/**
 * Public player events (contracts/events.md, FR-027) and the extended-event logic.
 * The extended events are pure: the layer feeds media state in, the tracker emits typed events out.
 */

/** `eventData` of `error`: a media error or a Cloudinary error. */
export interface PlayerErrorData {
  readonly code: number;
  readonly message: string;
  readonly statusCode?: number;
}

/** Video rendition size, as reported by `qualitychanged`. */
export interface VideoResolution {
  readonly width: number;
  readonly height: number;
}

/**
 * The one typed list of public events: event name → `eventData` (`undefined` when there is none).
 * Internal events are not in it. Ad events are added when R-04 fixes their names.
 */
export interface PlayerEventMap {
  // Media events, forwarded from the media element.
  loadstart: undefined;
  suspend: undefined;
  abort: undefined;
  emptied: undefined;
  stalled: undefined;
  loadedmetadata: undefined;
  loadeddata: undefined;
  canplay: undefined;
  canplaythrough: undefined;
  playing: undefined;
  waiting: undefined;
  seeking: undefined;
  seeked: undefined;
  ended: undefined;
  durationchange: undefined;
  timeupdate: undefined;
  progress: undefined;
  play: undefined;
  pause: undefined;
  ratechange: undefined;
  volumechange: undefined;
  fullscreenchange: undefined;
  posterchange: undefined;
  // Cloudinary events.
  playerload: undefined;
  ready: undefined;
  videoload: undefined;
  start: undefined;
  pausenoseek: undefined;
  seek: { readonly seekStart: number; readonly seekEnd: number };
  mute: undefined;
  unmute: undefined;
  percentsplayed: { readonly percent: number };
  timeplayed: { readonly time: number };
  qualitychanged: { readonly from: VideoResolution | null; readonly to: VideoResolution };
  // `unknown` until the Source and SourceOptions types land (T029, T039).
  sourcechanged: { readonly source: unknown; readonly sourceOptions: unknown };
  /** Media or Cloudinary error. */
  error: PlayerErrorData;
  dispose: undefined;
  // Playlist events. `unknown` until the playlist state types land (T044).
  playlistcreated: undefined;
  playlistitemchanged: { readonly playlist: unknown; readonly current: unknown; readonly next: unknown };
  upcomingvideoshow: undefined;
  upcomingvideohide: undefined;
}

export type PlayerEventName = keyof PlayerEventMap;

/** The arguments after the event name: none, or the `eventData`. */
export type PlayerEventArgs<K extends PlayerEventName> = PlayerEventMap[K] extends undefined ? [] : [eventData: PlayerEventMap[K]];

/** A milestone fires when `currentTime` is within this many seconds of it (v4). */
const MILESTONE_GRACE_SECONDS = 0.5;

export type ExtendedEventName = 'videoload' | 'start' | 'pausenoseek' | 'seek' | 'mute' | 'unmute' | 'percentsplayed' | 'timeplayed';

export type ExtendedEventsEmit = <K extends ExtendedEventName>(type: K, ...args: PlayerEventArgs<K>) => void;

/** The media state the tracker reads. An `HTMLMediaElement` satisfies it. */
export interface MediaState {
  readonly currentTime: number;
  readonly duration: number;
  readonly seeking: boolean;
  readonly ended: boolean;
  readonly muted: boolean;
}

export interface ExtendedEventsOptions {
  /** The normalized `playedEventPercents` option. */
  readonly playedEventPercents: readonly number[];
  readonly playedEventTimes?: readonly number[];
  /** The initial muted state: `mute`/`unmute` fire only when it changes. Default `false`. */
  readonly muted?: boolean;
}

export type ExtendedEventsMediaEvent = 'loadedmetadata' | 'playing' | 'timeupdate' | 'seeking' | 'seeked' | 'pause' | 'volumechange';

export interface ExtendedEvents {
  /** Media event name → handler. Call each one on the media event of the same name, with the media state. */
  readonly handlers: { readonly [K in ExtendedEventsMediaEvent]: (media: MediaState) => void };
  /** Call when the source changes: `videoload`, `start` and the milestones fire again for the next source. */
  readonly reset: () => void;
}

/**
 * Tracks one player's extended events: `videoload`, `start` and the milestones once per source,
 * `seek { seekStart, seekEnd }`, `pausenoseek`, `mute`/`unmute`.
 */
export function createExtendedEvents(options: ExtendedEventsOptions, emit: ExtendedEventsEmit): ExtendedEvents {
  const { playedEventPercents, playedEventTimes = [] } = options;
  let muted = options.muted ?? false;
  let loaded = false;
  let started = false;
  let lastTime = 0;
  let seekStart: number | undefined;
  const percentsFired = new Set<number>();
  const timesFired = new Set<number>();

  const reached = (fired: Set<number>, value: number, checkpoint: number, currentTime: number): boolean => {
    if (fired.has(value) || Math.abs(currentTime - checkpoint) > MILESTONE_GRACE_SECONDS) {
      return false;
    }
    fired.add(value);
    return true;
  };

  const handlers: ExtendedEvents['handlers'] = {
    loadedmetadata: () => {
      if (!loaded) {
        loaded = true;
        emit('videoload');
      }
    },
    playing: () => {
      if (!started) {
        started = true;
        emit('start');
      }
    },
    timeupdate: ({ currentTime, duration }) => {
      lastTime = currentTime;
      // No percent milestones while the duration is unknown, or infinite (live).
      const percents = Number.isFinite(duration) && duration > 0 ? playedEventPercents : [];
      for (const percent of percents) {
        if (reached(percentsFired, percent, (duration * percent) / 100, currentTime)) {
          emit('percentsplayed', { percent });
        }
      }
      for (const time of playedEventTimes) {
        if (reached(timesFired, time, time, currentTime)) {
          emit('timeplayed', { time });
        }
      }
    },
    // While the viewer scrubs, `seeking` fires again before `seeked`: keep the first start.
    seeking: () => {
      seekStart ??= lastTime;
    },
    // Seeks of 1 s or less are not reported (v4): engines and start positions also set `currentTime`.
    seeked: ({ currentTime }) => {
      const start = seekStart ?? lastTime;
      if (Math.abs(currentTime - start) > 1) {
        emit('seek', { seekStart: start, seekEnd: currentTime });
      }
      seekStart = undefined;
      lastTime = currentTime;
    },
    pause: ({ seeking, ended }) => {
      if (!seeking && !ended) {
        emit('pausenoseek');
      }
    },
    volumechange: (media) => {
      if (media.muted !== muted) {
        muted = media.muted;
        emit(muted ? 'mute' : 'unmute');
      }
    },
  };

  const reset = (): void => {
    loaded = false;
    started = false;
    lastTime = 0;
    seekStart = undefined;
    percentsFired.clear();
    timesFired.clear();
  };

  return { handlers, reset };
}
