// Lint case: directory import. A `**/player/**` glob misses `../player`; the regex pattern catches it.
import { createPlayer } from '../player';
export const create = createPlayer;
