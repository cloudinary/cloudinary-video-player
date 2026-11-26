import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createExtendedEvents } from '../../src/core/events.js';
import { DEFAULTS } from '../../src/core/options/defaults.js';
import type { ExtendedEventsEmit, ExtendedEventsOptions, MediaState, PlayerEventMap } from '../../src/core/events.js';

const media = (state: Partial<MediaState> = {}): MediaState => ({
  currentTime: 0,
  duration: 100,
  seeking: false,
  ended: false,
  muted: false,
  ...state,
});

// The normalized default the layer passes.
const playedEventPercents = DEFAULTS.playedEventPercents ?? [];

const setup = (overrides: Partial<ExtendedEventsOptions> = {}) => {
  const options: ExtendedEventsOptions = { playedEventPercents, ...overrides };
  const emit = vi.fn();
  const { handlers, reset } = createExtendedEvents(options, emit);
  // Plays from `from` to `to` in 0.25 s steps, as browsers fire `timeupdate`.
  const play = (from: number, to: number, duration = 100) => {
    for (let time = from; time <= to; time += 0.25) {
      handlers.timeupdate(media({ currentTime: time, duration }));
    }
  };
  const seek = (from: number, to: number) => {
    handlers.timeupdate(media({ currentTime: from }));
    handlers.seeking(media({ currentTime: to, seeking: true }));
    handlers.timeupdate(media({ currentTime: to }));
    handlers.seeked(media({ currentTime: to }));
  };
  const emitted = (type: string) => emit.mock.calls.filter(([name]) => name === type).map(([, data]) => data);
  return { emit, handlers, reset, play, seek, emitted };
};

describe('PlayerEventMap', () => {
  it('types the contract payloads', () => {
    expectTypeOf<PlayerEventMap['seek']>().toEqualTypeOf<{ readonly seekStart: number; readonly seekEnd: number }>();
    expectTypeOf<PlayerEventMap['percentsplayed']>().toEqualTypeOf<{ readonly percent: number }>();
    expectTypeOf<PlayerEventMap['timeplayed']>().toEqualTypeOf<{ readonly time: number }>();
    expectTypeOf<PlayerEventMap['error']>().toEqualTypeOf<{ readonly code: number; readonly message: string; readonly statusCode?: number }>();
    expectTypeOf<PlayerEventMap['videoload']>().toEqualTypeOf<undefined>();
    expectTypeOf<PlayerEventMap['playerload']>().toEqualTypeOf<undefined>();
  });

  it('leaves internal and removed v4 events out', () => {
    expectTypeOf<PlayerEventMap>().not.toHaveProperty('cldsourcechanged');
    expectTypeOf<PlayerEventMap>().not.toHaveProperty('refresh');
    expectTypeOf<PlayerEventMap>().not.toHaveProperty('retryplaylist');
    expectTypeOf<PlayerEventMap>().not.toHaveProperty('productClick');
  });

  it('lets the layer wire a media element and a forwarding function', () => {
    expectTypeOf<HTMLMediaElement>().toExtend<MediaState>();
    expectTypeOf<(type: string, eventData?: unknown) => void>().toExtend<ExtendedEventsEmit>();
  });
});

describe('percentsplayed', () => {
  it('fires 25, 50, 75 and 100 once each by default', () => {
    const { play, emitted } = setup();
    play(0, 100);
    expect(emitted('percentsplayed')).toEqual([{ percent: 25 }, { percent: 50 }, { percent: 75 }, { percent: 100 }]);
  });

  it('uses playedEventPercents instead of the default', () => {
    const { play, emitted } = setup({ playedEventPercents: [10] });
    play(0, 100);
    expect(emitted('percentsplayed')).toEqual([{ percent: 10 }]);
  });

  it('fires nothing for an empty playedEventPercents', () => {
    const { play, emitted } = setup({ playedEventPercents: [] });
    play(0, 100);
    expect(emitted('percentsplayed')).toEqual([]);
  });

  it('fires within 0.5 s of the milestone only', () => {
    const { handlers, emitted } = setup({ playedEventPercents: [50] });
    handlers.timeupdate(media({ currentTime: 49.4 }));
    handlers.timeupdate(media({ currentTime: 50.6 }));
    expect(emitted('percentsplayed')).toEqual([]);
    handlers.timeupdate(media({ currentTime: 50.4 }));
    expect(emitted('percentsplayed')).toEqual([{ percent: 50 }]);
  });

  it('fires nothing while the duration is unknown or infinite (live)', () => {
    const { handlers, emitted } = setup();
    for (const duration of [Number.NaN, 0, Number.POSITIVE_INFINITY]) {
      handlers.timeupdate(media({ currentTime: 0, duration }));
    }
    expect(emitted('percentsplayed')).toEqual([]);
  });
});

describe('timeplayed', () => {
  it('fires each playedEventTimes value once, with no v4 originalType in the payload', () => {
    const { play, emitted } = setup({ playedEventTimes: [5, 10] });
    play(0, 20);
    expect(emitted('timeplayed')).toEqual([{ time: 5 }, { time: 10 }]);
  });

  it('fires nothing by default', () => {
    const { play, emitted } = setup();
    play(0, 20);
    expect(emitted('timeplayed')).toEqual([]);
  });
});

describe('milestones per source', () => {
  it('do not fire again after a seek back (v4 reset them on every seek)', () => {
    const { play, seek, emitted } = setup({ playedEventPercents: [25], playedEventTimes: [5] });
    play(0, 30);
    seek(30, 0);
    play(0, 30);
    expect(emitted('percentsplayed')).toEqual([{ percent: 25 }]);
    expect(emitted('timeplayed')).toEqual([{ time: 5 }]);
  });

  it('fire again for the next source after reset()', () => {
    const { play, reset, emitted } = setup({ playedEventPercents: [25] });
    play(0, 30);
    reset();
    play(0, 30);
    expect(emitted('percentsplayed')).toEqual([{ percent: 25 }, { percent: 25 }]);
  });
});

describe('seek', () => {
  it('reports where the seek started and ended', () => {
    const { seek, emitted } = setup();
    seek(12, 40);
    expect(emitted('seek')).toEqual([{ seekStart: 12, seekEnd: 40 }]);
  });

  it('reports one seek from the first start while the viewer scrubs', () => {
    const { handlers, emitted } = setup();
    handlers.timeupdate(media({ currentTime: 12 }));
    handlers.seeking(media({ currentTime: 20, seeking: true }));
    handlers.timeupdate(media({ currentTime: 20 }));
    handlers.seeking(media({ currentTime: 30, seeking: true }));
    handlers.seeked(media({ currentTime: 30 }));
    expect(emitted('seek')).toEqual([{ seekStart: 12, seekEnd: 30 }]);
  });

  it('does not report a seek of 1 s or less (v4), such as an engine nudging currentTime', () => {
    const { seek, emitted } = setup();
    seek(30, 30.1);
    seek(30.1, 31.1);
    expect(emitted('seek')).toEqual([]);
  });

  it('starts the next seek where the last one ended', () => {
    const { handlers, seek, emitted } = setup();
    seek(12, 40);
    handlers.seeking(media({ currentTime: 5, seeking: true }));
    handlers.seeked(media({ currentTime: 5 }));
    expect(emitted('seek')).toEqual([
      { seekStart: 12, seekEnd: 40 },
      { seekStart: 40, seekEnd: 5 },
    ]);
  });
});

describe('pausenoseek', () => {
  it('fires on a pause', () => {
    const { handlers, emitted } = setup();
    handlers.pause(media({ currentTime: 10 }));
    expect(emitted('pausenoseek')).toEqual([undefined]);
  });

  it('does not fire for a pause during a seek or at the end', () => {
    const { handlers, emitted } = setup();
    handlers.pause(media({ currentTime: 10, seeking: true }));
    handlers.pause(media({ currentTime: 100, ended: true }));
    expect(emitted('pausenoseek')).toEqual([]);
  });

  it('fires for a pause after a seek (v4 missed it until the next play)', () => {
    const { handlers, seek, emitted } = setup();
    seek(10, 40);
    handlers.pause(media({ currentTime: 41 }));
    expect(emitted('pausenoseek')).toEqual([undefined]);
  });
});

describe('start and videoload', () => {
  it('fire once per source, also after a seek (v4 fired start again after each seek)', () => {
    const { handlers, seek, emitted } = setup();
    handlers.loadedmetadata(media());
    handlers.playing(media());
    seek(10, 40);
    handlers.loadedmetadata(media());
    handlers.playing(media());
    expect(emitted('videoload')).toHaveLength(1);
    expect(emitted('start')).toHaveLength(1);
  });

  it('fire again for the next source after reset()', () => {
    const { handlers, reset, emitted } = setup();
    handlers.loadedmetadata(media());
    handlers.playing(media());
    reset();
    handlers.loadedmetadata(media());
    handlers.playing(media());
    expect(emitted('videoload')).toEqual([undefined, undefined]);
    expect(emitted('start')).toEqual([undefined, undefined]);
  });
});

describe('mute and unmute', () => {
  it('fire only when the muted state changes (v4 fired on the first volume change)', () => {
    const { handlers, emit } = setup();
    handlers.volumechange(media({ muted: false }));
    handlers.volumechange(media({ muted: true }));
    handlers.volumechange(media({ muted: true }));
    handlers.volumechange(media({ muted: false }));
    expect(emit.mock.calls).toEqual([['mute'], ['unmute']]);
  });

  it('start from the muted option', () => {
    const { handlers, emit } = setup({ muted: true });
    handlers.volumechange(media({ muted: true }));
    handlers.volumechange(media({ muted: false }));
    expect(emit.mock.calls).toEqual([['unmute']]);
  });

  it('keep the muted state across sources', () => {
    const { handlers, reset, emit } = setup();
    handlers.volumechange(media({ muted: true }));
    reset();
    handlers.volumechange(media({ muted: true }));
    expect(emit.mock.calls).toEqual([['mute']]);
  });
});
