import { basics } from './basics.ts';
import type { Preset } from './types.ts';

export type { Preset, PresetPlayer } from './types.ts';

export const presets: Preset[] = [...basics];

export const findPreset = (id: string | null): Preset | undefined => presets.find((preset) => preset.id === id);
