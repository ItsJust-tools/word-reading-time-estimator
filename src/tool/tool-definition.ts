import type { Tool, DeserializeResult } from '@itsjust/core';
import toolConfig from './tool.config';
import {
  DEFAULT_STATE,
  MAX_HISTORY,
  MAX_WPM,
  MIN_WPM,
  summaryText,
  type HistoryEntry,
  type TimingMode,
  type ToolState,
} from './types';

const VALID_MODES: TimingMode[] = ['read', 'speak'];

/** Clamp a WPM value into the supported range, defaulting when invalid. */
export function clampWpm(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const wpm = Math.round(value);
  if (wpm < MIN_WPM) return MIN_WPM;
  if (wpm > MAX_WPM) return MAX_WPM;
  return wpm;
}

/** Serialize tool state into a compact JSON string for share/import. */
export function serializeState(state: ToolState): string {
  return JSON.stringify({
    text: state.text,
    readingWpm: state.readingWpm,
    speakingWpm: state.speakingWpm,
    mode: state.mode,
    showParagraphBreakdown: state.showParagraphBreakdown,
    history: state.history,
  });
}

function validHistory(value: unknown): HistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is HistoryEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as HistoryEntry).text === 'string' &&
        typeof (entry as HistoryEntry).createdAt === 'string'
    )
    .slice(0, MAX_HISTORY);
}

/** Validate and recover tool state from an arbitrary payload. */
export function deserializeState(data: unknown): DeserializeResult<ToolState> {
  const recognized =
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    (() => {
      const d = data as Record<string, unknown>;
      return (
        typeof d.text === 'string' ||
        typeof d.readingWpm === 'number' ||
        typeof d.speakingWpm === 'number' ||
        typeof d.mode === 'string' ||
        typeof d.showParagraphBreakdown === 'boolean' ||
        Array.isArray(d.history)
      );
    })();
  if (!recognized) {
    return {
      success: false,
      error: 'Invalid data format: expected reading time estimator state object',
    };
  }
  const v = data as Partial<ToolState>;
  const state: ToolState = {
    text: typeof v.text === 'string' ? v.text : DEFAULT_STATE.text,
    readingWpm: clampWpm(v.readingWpm, DEFAULT_STATE.readingWpm),
    speakingWpm: clampWpm(v.speakingWpm, DEFAULT_STATE.speakingWpm),
    mode: VALID_MODES.includes(v.mode as TimingMode) ? (v.mode as TimingMode) : DEFAULT_STATE.mode,
    showParagraphBreakdown:
      typeof v.showParagraphBreakdown === 'boolean'
        ? v.showParagraphBreakdown
        : DEFAULT_STATE.showParagraphBreakdown,
    history: validHistory(v.history),
  };
  return { success: true, data: state };
}

/** Append a history entry to state, capped at MAX_HISTORY, newest first. */
export function withHistory(state: ToolState, text: string, now = new Date()): ToolState {
  const entry: HistoryEntry = { text, createdAt: now.toISOString() };
  return { ...state, history: [entry, ...state.history].slice(0, MAX_HISTORY) };
}

/** True when a serialized string round-trips back to the same state. */
export function roundTrips(state: ToolState): boolean {
  try {
    const restored = deserializeState(JSON.parse(serializeState(state)));
    return restored.success && JSON.stringify(restored.data) === JSON.stringify(state);
  } catch {
    return false;
  }
}

export const readingTimeTool: Tool<ToolState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: { ...DEFAULT_STATE },
  serialize: serializeState,
  deserialize: deserializeState,
  exporters: [
    { format: 'png', loader: () => import('./exporters/png') },
    { format: 'jpeg', loader: () => import('./exporters/jpeg') },
    { format: 'webp', loader: () => import('./exporters/webp') },
    { format: 'pdf', loader: () => import('./exporters/pdf') },
  ],
};

export { summaryText };
