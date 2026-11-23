import { DEFAULT_STATE, WPM_PRESETS, type ToolState } from './types';

/** The WPM presets offered in the sidebar. */
export const SPEED_PRESETS = WPM_PRESETS;

/** Human label for the active timing mode. */
export function modeLabel(mode: ToolState['mode']): string {
  return mode === 'speak' ? 'Speaking time' : 'Reading time';
}

export function defaultState(): ToolState {
  return { ...DEFAULT_STATE };
}
