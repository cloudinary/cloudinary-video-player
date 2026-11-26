// Lint case: sibling feature through a longer relative path (missed by the `^../[^.]` regex alone).
import { setup } from '../../features/chapters/index.js';
export const other = setup;
