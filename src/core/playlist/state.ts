/**
 * Playlist state (data-model §8): items, current index and the playlist options, with the v4 rules for
 * next, previous and repeat. No player and no timers: the playlist feature plays the current item when a
 * move returns `true`, and runs the auto-advance and upcoming-overlay timers itself.
 *
 * `loading` → `ready`: moves asked for while `loading` are queued and applied once, in call order, by
 * `ready()` (US6-2; v4 recursed forever when `playNext()` came before the playlist had loaded).
 */

/** The options of `player.playlist(sources, options)`. */
export interface PlaylistOptions {
  /** After the last item, `next()` goes back to the first one. @default false */
  readonly repeat?: boolean;
  /** Seconds after an item ends before the next one starts; `true` = 0 (at once). @default false */
  readonly autoAdvance?: boolean | number;
  /** Seconds before the end of an item to show the upcoming item; `true` = 10. @default false */
  readonly presentUpcoming?: boolean | number;
}

export type PlaylistStatus = 'loading' | 'ready';

type Move = 'next' | 'previous' | number;

const toDelay = (value: boolean | number, whenTrue: number): false | number =>
  value === true ? whenTrue : value;

export class PlaylistState<T = unknown> {
  #status: PlaylistStatus = 'loading';
  #items: readonly T[] = [];
  #index = -1;
  #queue: Move[] = [];
  #repeat = false;
  #autoAdvance: false | number = false;
  #presentUpcoming: false | number = false;

  constructor(options: PlaylistOptions = {}) {
    this.setOptions(options);
  }

  get status(): PlaylistStatus {
    return this.#status;
  }

  get items(): readonly T[] {
    return this.#items;
  }

  /** Index of the current item; -1 while `loading` or when the list is empty. */
  get index(): number {
    return this.#index;
  }

  get repeat(): boolean {
    return this.#repeat;
  }

  /** `false`, or seconds (0 = at once). */
  get autoAdvance(): false | number {
    return this.#autoAdvance;
  }

  /** `false`, or seconds before the end. */
  get presentUpcoming(): false | number {
    return this.#presentUpcoming;
  }

  /** Changes only the options that are set. */
  setOptions({ repeat, autoAdvance, presentUpcoming }: PlaylistOptions): void {
    if (repeat !== undefined) this.#repeat = repeat;
    if (autoAdvance !== undefined) this.#autoAdvance = toDelay(autoAdvance, 0);
    if (presentUpcoming !== undefined) this.#presentUpcoming = toDelay(presentUpcoming, 10);
  }

  /**
   * Sets the items and goes to `ready` at the first item, then applies the queued moves once, in call order
   * (moves that are not possible are dropped). Returns `true` when a queued move set the current item, so
   * the feature plays it as v4 `playNext()` / `playAtIndex()` do; `false` when it only loads the first item.
   */
  ready(items: readonly T[]): boolean {
    const queue = this.#queue;
    this.#status = 'ready';
    this.#items = items;
    this.#index = items.length ? 0 : -1;
    this.#queue = [];
    return queue.reduce((moved, move) => this.#move(move) || moved, false);
  }

  /** Goes to the next item (to the first one after the last when `repeat` is on). */
  next(): boolean {
    return this.#move('next');
  }

  /** Goes to the previous item. Never wraps, also with `repeat` (as v4). */
  previous(): boolean {
    return this.#move('previous');
  }

  /** Goes to the item at `index`. */
  playAt(index: number): boolean {
    return this.#move(index);
  }

  isFirst(): boolean {
    return this.#index === 0;
  }

  isLast(): boolean {
    return this.#index >= this.#items.length - 1;
  }

  /** The item that `next()` goes to, or `null`. */
  upcoming(): T | null {
    const index = this.#target('next');
    return index === -1 ? null : this.#items[index];
  }

  // The index a move goes to, or -1 when it is not possible.
  #target(move: Move): number {
    const last = this.#items.length - 1;
    if (move === 'next') return this.#index < last ? this.#index + 1 : this.#repeat && last >= 0 ? 0 : -1;
    if (move === 'previous') return this.#index > 0 ? this.#index - 1 : -1;
    return Number.isInteger(move) && move >= 0 && move <= last ? move : -1;
  }

  // While `loading`, queues the move and returns false. Otherwise returns true when the move set the index,
  // even to the same item (`next()` with `repeat` on a one-item list plays it again, as v4).
  #move(move: Move): boolean {
    if (this.#status === 'loading') {
      this.#queue.push(move);
      return false;
    }
    const index = this.#target(move);
    if (index === -1) return false;
    this.#index = index;
    return true;
  }
}
