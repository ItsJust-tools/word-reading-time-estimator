import { describe, it, expect } from 'vitest';
import {
  DEFAULT_STATE,
  MAX_HISTORY,
  countCharacters,
  countParagraphs,
  countSentences,
  countWords,
  estimateSeconds,
  formatDuration,
  paragraphBreakdown,
  textStats,
  wordExtremes,
  words,
  type ToolState,
} from '@/tool/types';
import {
  clampWpm,
  deserializeState,
  serializeState,
  roundTrips,
  withHistory,
} from '@/tool/tool-definition';

const state = (patch: Partial<ToolState> = {}): ToolState => ({ ...DEFAULT_STATE, ...patch });

const SAMPLE =
  'The quick brown fox jumps over the lazy dog.\n\nSecond paragraph has five words exactly.';

describe('counting', () => {
  it('counts words for known text', () => {
    expect(countWords('hello world')).toBe(2);
    expect(countWords(SAMPLE)).toBe(9 + 6);
  });

  it('returns zero for empty and whitespace-only text', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n\t  ')).toBe(0);
    expect(words('')).toEqual([]);
  });

  it('counts characters including whitespace', () => {
    expect(countCharacters('ab c')).toBe(4);
    expect(countCharacters('')).toBe(0);
  });

  it('counts sentences by terminators', () => {
    expect(countSentences('One. Two! Three?')).toBe(3);
    expect(countSentences('No terminator')).toBe(1);
    expect(countSentences('   ')).toBe(0);
  });

  it('counts paragraphs split by blank lines', () => {
    expect(countParagraphs(SAMPLE)).toBe(2);
    expect(countParagraphs('single')).toBe(1);
    expect(countParagraphs('')).toBe(0);
    expect(countParagraphs('a\n\n\n\nb')).toBe(2);
  });
});

describe('estimateSeconds', () => {
  it('computes seconds from word count and wpm', () => {
    expect(estimateSeconds(200, 200)).toBe(60);
    expect(estimateSeconds(100, 150)).toBe(40);
    expect(estimateSeconds(130, 130)).toBe(60);
  });

  it('rounds to whole seconds', () => {
    expect(estimateSeconds(10, 3)).toBe(200);
  });

  it('returns 0 for empty counts and invalid wpm', () => {
    expect(estimateSeconds(0, 200)).toBe(0);
    expect(estimateSeconds(-5, 200)).toBe(0);
    expect(estimateSeconds(100, 0)).toBe(0);
    expect(estimateSeconds(100, -1)).toBe(0);
    expect(estimateSeconds(100, NaN)).toBe(0);
  });
});

describe('formatDuration', () => {
  it('formats seconds, minutes and hours', () => {
    expect(formatDuration(0)).toBe('0 sec');
    expect(formatDuration(45)).toBe('45 sec');
    expect(formatDuration(60)).toBe('1 min');
    expect(formatDuration(200)).toBe('3 min 20 sec');
    expect(formatDuration(3600)).toBe('1 h');
    expect(formatDuration(3900)).toBe('1 h 5 min');
    expect(formatDuration(-3)).toBe('0 sec');
    expect(formatDuration(NaN)).toBe('0 sec');
  });
});

describe('wordExtremes', () => {
  it('finds longest and shortest words plus average length', () => {
    const e = wordExtremes('hi extraordinary a');
    expect(e.longest).toBe('extraordinary');
    expect(e.shortest).toBe('a');
    expect(e.averageLength).toBeCloseTo((2 + 13 + 1) / 3);
  });

  it('returns nulls and zero average for empty text', () => {
    expect(wordExtremes('').longest).toBeNull();
    expect(wordExtremes('').shortest).toBeNull();
    expect(wordExtremes('').averageLength).toBe(0);
  });
});

describe('paragraphBreakdown', () => {
  it('estimates each paragraph at the given wpm', () => {
    const rows = paragraphBreakdown(SAMPLE, 200);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.words).toBe(9);
    expect(rows[0]?.seconds).toBe(3);
    expect(rows[1]?.preview.startsWith('Second paragraph')).toBe(true);
  });

  it('returns empty for empty text', () => {
    expect(paragraphBreakdown('', 200)).toEqual([]);
  });
});

describe('textStats', () => {
  it('computes full stats for the known sample', () => {
    const stats = textStats(SAMPLE, 200, 130);
    expect(stats.words).toBe(15);
    expect(stats.paragraphs).toBe(2);
    expect(stats.sentences).toBe(2);
    expect(stats.readSeconds).toBe(5);
    expect(stats.speakSeconds).toBe(7);
  });

  it('is fully zeroed for empty input without NaN', () => {
    const stats = textStats('   ', 200, 130);
    expect(stats.words).toBe(0);
    expect(stats.readSeconds).toBe(0);
    expect(stats.speakSeconds).toBe(0);
    expect(stats.extremes.averageLength).toBe(0);
    expect(Number.isNaN(stats.extremes.averageLength)).toBe(false);
  });
});

describe('serialize/deserialize', () => {
  it('round-trips state losslessly', () => {
    const s = state({ text: SAMPLE, readingWpm: 150, speakingWpm: 140, mode: 'speak' });
    expect(roundTrips(s)).toBe(true);
  });

  it('produces stable JSON', () => {
    const s = state({ text: 'hello' });
    expect(JSON.parse(serializeState(s))).toMatchObject({ text: 'hello', readingWpm: 200 });
  });

  it('deserializes valid payloads', () => {
    const result = deserializeState(JSON.parse(serializeState(state({ text: 'abc' }))));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.text).toBe('abc');
  });

  it('rejects invalid payloads', () => {
    expect(deserializeState(null).success).toBe(false);
    expect(deserializeState('string').success).toBe(false);
    expect(deserializeState(42).success).toBe(false);
    expect(deserializeState({}).success).toBe(false);
  });

  it('clamps out-of-range WPM values', () => {
    const result = deserializeState({
      text: 'x',
      readingWpm: 5000,
      speakingWpm: 1,
      mode: 'read',
      showParagraphBreakdown: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.readingWpm).toBe(1000);
      expect(result.data.speakingWpm).toBe(60);
    }
  });

  it('falls back to defaults for bad fields', () => {
    const result = deserializeState({
      text: 42,
      readingWpm: 'fast',
      speakingWpm: null,
      mode: 'sing',
      showParagraphBreakdown: 'yes',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe('');
      expect(result.data.readingWpm).toBe(DEFAULT_STATE.readingWpm);
      expect(result.data.speakingWpm).toBe(DEFAULT_STATE.speakingWpm);
      expect(result.data.mode).toBe('read');
      expect(result.data.showParagraphBreakdown).toBe(true);
    }
  });
});

describe('clampWpm', () => {
  it('clamps and rounds values', () => {
    expect(clampWpm(30, 200)).toBe(60);
    expect(clampWpm(5000, 200)).toBe(1000);
    expect(clampWpm(200.6, 200)).toBe(201);
    expect(clampWpm('fast', 200)).toBe(200);
    expect(clampWpm(NaN, 200)).toBe(200);
  });
});

describe('withHistory', () => {
  it('prepends entries and caps at MAX_HISTORY', () => {
    let s = state();
    for (let i = 0; i < MAX_HISTORY + 5; i++) {
      s = withHistory(s, `entry-${i}`, new Date(2026, 0, 1));
    }
    expect(s.history).toHaveLength(MAX_HISTORY);
    expect(s.history[0]?.text).toBe(`entry-${MAX_HISTORY + 4}`);
  });
});
