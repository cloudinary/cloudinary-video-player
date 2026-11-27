import { describe, expect, it } from 'vitest';
import { PlaylistState, type PlaylistOptions } from '../../src/core/playlist/state.js';

const playlist = (items: readonly string[] = ['a', 'b', 'c'], options?: PlaylistOptions) => {
  const state = new PlaylistState<string>(options);
  state.ready(items);
  return state;
};

describe('PlaylistState', () => {
  it('starts loading, and is ready at the first item once the items are set', () => {
    const state = new PlaylistState<string>();

    expect([state.status, state.index]).toEqual(['loading', -1]);
    expect(state.ready(['a', 'b'])).toBe(false);
    expect([state.status, state.index, state.items]).toEqual(['ready', 0, ['a', 'b']]);
  });

  it('changes the current item with playAt (v4 "video change")', () => {
    const state = playlist();

    expect(state.playAt(1)).toBe(true);
    expect(state.items[state.index]).toBe('b');
  });

  it('ignores playAt with an index outside the list (v4 threw)', () => {
    const state = playlist();

    expect([state.playAt(3), state.playAt(-1), state.playAt(1.5)]).toEqual([false, false, false]);
    expect(state.index).toBe(0);
  });

  it('stops at the last item without repeat, and goes back to the first with repeat', () => {
    const once = playlist();
    const looping = playlist(['a', 'b', 'c'], { repeat: true });
    once.playAt(2);
    looping.playAt(2);

    expect([once.next(), once.index]).toEqual([false, 2]);
    expect([looping.next(), looping.index]).toEqual([true, 0]);
  });

  it('never wraps on previous, also with repeat (as v4)', () => {
    const state = playlist(['a', 'b', 'c'], { repeat: true });

    expect([state.previous(), state.index]).toEqual([false, 0]);
    state.playAt(2);
    expect([state.previous(), state.index]).toEqual([true, 1]);
  });

  it('tells the first and last item', () => {
    const state = playlist();

    expect([state.isFirst(), state.isLast()]).toEqual([true, false]);
    state.playAt(2);
    expect([state.isFirst(), state.isLast()]).toEqual([false, true]);
  });

  it('gives the upcoming item: the next one, the first after the last with repeat, else null', () => {
    const state = playlist();

    expect(state.upcoming()).toBe('b');
    state.playAt(2);
    expect(state.upcoming()).toBeNull();
    state.setOptions({ repeat: true });
    expect(state.upcoming()).toBe('a');
  });

  it('plays a one-item list again on next with repeat (as v4)', () => {
    const state = playlist(['a'], { repeat: true });

    expect([state.next(), state.index, state.upcoming()]).toEqual([true, 0, 'a']);
  });

  it('turns `true` into the v4 defaults: auto-advance at once, upcoming 10 s before the end', () => {
    expect(playlist(['a'], { autoAdvance: true, presentUpcoming: true })).toMatchObject({ autoAdvance: 0, presentUpcoming: 10 });
    expect(playlist(['a'], { autoAdvance: 5, presentUpcoming: 8 })).toMatchObject({ autoAdvance: 5, presentUpcoming: 8 });
    expect(playlist(['a'])).toMatchObject({ repeat: false, autoAdvance: false, presentUpcoming: false });
  });

  it('changes only the options that are set', () => {
    const state = playlist(['a'], { repeat: true, autoAdvance: 3, presentUpcoming: 8 });

    state.setOptions({ autoAdvance: false });

    expect(state).toMatchObject({ repeat: true, autoAdvance: false, presentUpcoming: 8 });
  });

  it('queues moves while loading and applies them once, in call order, when ready (US6-2)', () => {
    const state = new PlaylistState<string>();

    expect([state.playAt(2), state.previous(), state.next(), state.next()]).toEqual([false, false, false, false]);
    expect(state.index).toBe(-1);
    expect(state.ready(['a', 'b', 'c', 'd'])).toBe(true);
    expect(state.index).toBe(3);

    // Applied once: a new list starts again at the first item.
    expect(state.ready(['x', 'y'])).toBe(false);
    expect(state.index).toBe(0);
  });

  it('reports a queued move that ends at the first item, so the feature still plays it', () => {
    const state = new PlaylistState<string>();
    state.next();
    state.previous();

    expect(state.ready(['a', 'b'])).toBe(true);
    expect(state.index).toBe(0);
  });

  it('drops queued moves that are not possible, without failing', () => {
    const state = new PlaylistState<string>();
    state.playAt(9);
    state.previous();

    expect(state.ready(['a', 'b'])).toBe(false);
    expect(state.index).toBe(0);
  });

  it('has no current item for an empty list', () => {
    const state = new PlaylistState<string>({ repeat: true });
    state.next();

    expect(state.ready([])).toBe(false);
    expect([state.index, state.next(), state.previous(), state.playAt(0), state.upcoming()]).toEqual([-1, false, false, false, null]);
  });
});
