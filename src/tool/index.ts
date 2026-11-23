export { default as toolConfig } from './tool.config';
export { templateBaseVersion } from './template-metadata';
export { templateMetadata, getPublicSiteUrl } from './template-metadata';
export {
  readingTimeTool,
  serializeState,
  deserializeState,
  withHistory,
  roundTrips,
  clampWpm,
  summaryText,
} from './tool-definition';
export { Canvas } from './components/Canvas';
export { Sidebar } from './components/Sidebar';
export { Toolbar } from './components/Toolbar';
export { SPEED_PRESETS, modeLabel, defaultState } from './ui-shared';
export {
  DEFAULT_STATE,
  MAX_HISTORY,
  MAX_WPM,
  MIN_WPM,
  WPM_PRESETS,
  words,
  countWords,
  countCharacters,
  countSentences,
  countParagraphs,
  estimateSeconds,
  formatDuration,
  paragraphBreakdown,
  activeWpm,
  wordExtremes,
  textStats,
  summaryText as summaryTextFromTypes,
  isState,
} from './types';
export type {
  TimingMode,
  ParagraphBreak,
  TextStats,
  WordExtremes,
  HistoryEntry,
  ToolState,
} from './types';
