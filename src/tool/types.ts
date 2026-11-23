export type TimingMode = 'read' | 'speak';

export interface ToolState {
  /** The pasted text to analyze. */
  text: string;
  /** Reading speed in words per minute. */
  readingWpm: number;
  /** Speaking speed in words per minute. */
  speakingWpm: number;
  /** Which timing mode is shown as the primary estimate. */
  mode: TimingMode;
  /** Whether the per-paragraph breakdown table is visible. */
  showParagraphBreakdown: boolean;
  /** Saved estimate summaries, newest first. */
  history: HistoryEntry[];
}

export const DEFAULT_STATE: ToolState = {
  text: '',
  readingWpm: 200,
  speakingWpm: 130,
  mode: 'read',
  showParagraphBreakdown: true,
  history: [],
};

export interface HistoryEntry {
  /** Human readable estimate summary. */
  text: string;
  /** ISO timestamp when the entry was saved. */
  createdAt: string;
}

export const MAX_HISTORY = 20;

export const MIN_WPM = 60;
export const MAX_WPM = 1000;

/** Reading-speed presets offered in the UI, plus the speaking preset. */
export const WPM_PRESETS: { label: string; wpm: number; mode: TimingMode | null }[] = [
  { label: 'Slow read (150)', wpm: 150, mode: 'read' },
  { label: 'Average read (200)', wpm: 200, mode: 'read' },
  { label: 'Fast read (300)', wpm: 300, mode: 'read' },
  { label: 'Speaking (130)', wpm: 130, mode: 'speak' },
];

/** Split text into raw words; empty for empty/whitespace-only text. */
export function words(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed.split(/\s+/).filter(Boolean);
}

export function countWords(text: string): number {
  return words(text).length;
}

export function countCharacters(text: string): number {
  return text.length;
}

export function countSentences(text: string): number {
  const matches = text.trim().match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
  if (!matches) return 0;
  return matches.map((s) => s.trim()).filter(Boolean).length;
}

export function countParagraphs(text: string): number {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean).length;
}

/** Seconds needed to get through `wordCount` at `wpm`. */
export function estimateSeconds(wordCount: number, wpm: number): number {
  if (!Number.isFinite(wpm) || wpm <= 0) return 0;
  if (!Number.isFinite(wordCount) || wordCount <= 0) return 0;
  return Math.round((wordCount / wpm) * 60);
}

/** Format a duration as a compact human string, e.g. "3 min 20 sec". */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0 sec';
  const s = Math.round(seconds);
  if (s < 60) return `${s} sec`;
  const minutes = Math.floor(s / 60);
  const rest = s % 60;
  if (minutes < 60) return rest > 0 ? `${minutes} min ${rest} sec` : `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const minsRest = minutes % 60;
  return minsRest > 0 ? `${hours} h ${minsRest} min` : `${hours} h`;
}

export interface ParagraphBreak {
  index: number;
  words: number;
  seconds: number;
  preview: string;
}

/** Split paragraphs by blank lines and estimate each at `wpm`. */
export function paragraphBreakdown(text: string, wpm: number): ParagraphBreak[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => {
      const wordCount = countWords(p);
      return {
        index: i + 1,
        words: wordCount,
        seconds: estimateSeconds(wordCount, wpm),
        preview: p.length > 80 ? `${p.slice(0, 77)}…` : p,
      };
    });
}

/** Primary wait/wpm used for the headline estimate. */
export function activeWpm(state: ToolState): number {
  return state.mode === 'speak' ? state.speakingWpm : state.readingWpm;
}

export interface WordExtremes {
  longest: string | null;
  shortest: string | null;
  averageLength: number;
}

/** Longest/shortest raw word and the mean word length. */
export function wordExtremes(text: string): WordExtremes {
  const list = words(text);
  if (list.length === 0) return { longest: null, shortest: null, averageLength: 0 };
  let longest: string = list[0] ?? '';
  let shortest: string = list[0] ?? '';
  let total = 0;
  for (const w of list) {
    if (w.length > longest.length) longest = w;
    if (w.length < shortest.length) shortest = w;
    total += w.length;
  }
  return { longest, shortest, averageLength: total / list.length };
}

export interface TextStats {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
  readSeconds: number;
  speakSeconds: number;
  extremes: WordExtremes;
}

/** All counts and estimates for a text. */
export function textStats(text: string, readingWpm: number, speakingWpm: number): TextStats {
  return {
    words: countWords(text),
    characters: countCharacters(text),
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readSeconds: estimateSeconds(countWords(text), readingWpm),
    speakSeconds: estimateSeconds(countWords(text), speakingWpm),
    extremes: wordExtremes(text),
  };
}

/** Compact summary used by the status bar and copy actions. */
export function summaryText(state: ToolState): string {
  const wpm = activeWpm(state);
  const label = state.mode === 'speak' ? 'Speaking time' : 'Reading time';
  return `${label}: ${formatDuration(estimateSeconds(countWords(state.text), wpm))} at ${wpm} WPM (${countWords(state.text)} words)`;
}

export function isState(value: unknown): value is ToolState {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
