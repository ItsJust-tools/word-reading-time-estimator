'use client';

import React from 'react';
import {
  activeWpm,
  countParagraphs,
  formatDuration,
  paragraphBreakdown,
  textStats,
  type ToolState,
} from '../types';

interface CanvasProps {
  state: ToolState;
  onChange?: (state: ToolState) => void;
  onSaveHistory?: (text: string) => void;
}

const textareaClass =
  'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 min-h-[12rem] font-mono';

function Stat({ label, value, testid }: { label: string; value: string; testid: string }) {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-3 text-center dark:border-gray-800 dark:bg-gray-900"
      data-testid={testid}
    >
      <span className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="block font-mono text-lg font-bold text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  );
}

export const Canvas: React.FC<CanvasProps> = ({ state, onChange, onSaveHistory }) => {
  const update = (patch: Partial<ToolState>) => onChange?.({ ...state, ...patch });
  const stats = textStats(state.text, state.readingWpm, state.speakingWpm);
  const wpm = activeWpm(state);
  const primarySeconds = state.mode === 'speak' ? stats.speakSeconds : stats.readSeconds;
  const primaryLabel = state.mode === 'speak' ? 'Speaking time' : 'Reading time';
  const breakdown = state.showParagraphBreakdown ? paragraphBreakdown(state.text, wpm) : [];
  const hasText = stats.words > 0;

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full" data-testid="tool-canvas">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Timing mode"
        data-testid="mode-tabs"
      >
        {(['read', 'speak'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={state.mode === mode}
            data-testid={`mode-tab-${mode}`}
            onClick={() => update({ mode })}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
              state.mode === mode
                ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-900/40 dark:text-violet-100'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400'
            }`}
          >
            {mode === 'read' ? 'Reading time' : 'Speaking time'}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Text to analyze
          <textarea
            value={state.text}
            onChange={(e) => update({ text: e.target.value })}
            data-testid="text-input"
            placeholder="Paste or type your text here…"
            className={textareaClass}
          />
        </label>
      </div>

      <div
        className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900"
        data-testid="result-card"
        role="status"
      >
        <span className="mb-1 block text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {primaryLabel}
        </span>
        <span
          className="block font-mono text-3xl font-bold text-gray-900 dark:text-gray-100"
          data-testid="result-main"
        >
          {hasText ? formatDuration(primarySeconds) : '—'}
        </span>
        <span className="mt-1 block text-xs text-gray-600 dark:text-gray-300">
          {hasText
            ? `at ${wpm} words per minute across ${stats.words} words`
            : 'Paste text above to get an estimate.'}
        </span>
        {hasText && onSaveHistory ? (
          <button
            type="button"
            data-testid="btn-save-history"
            onClick={() =>
              onSaveHistory?.(
                `${primaryLabel}: ${formatDuration(primarySeconds)} (${stats.words} words)`
              )
            }
            className="mt-3 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Save to history
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5" data-testid="stats-grid">
        <Stat label="Words" value={String(stats.words)} testid="stat-words" />
        <Stat label="Characters" value={String(stats.characters)} testid="stat-characters" />
        <Stat label="Sentences" value={String(stats.sentences)} testid="stat-sentences" />
        <Stat label="Paragraphs" value={String(stats.paragraphs)} testid="stat-paragraphs" />
        <Stat
          label="Avg word len"
          value={stats.words > 0 ? stats.extremes.averageLength.toFixed(1) : '0'}
          testid="stat-avg-word-length"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-1 font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Reading
          </h3>
          <p className="font-mono text-gray-900 dark:text-gray-100" data-testid="reading-time">
            {formatDuration(stats.readSeconds)}{' '}
            <span className="text-gray-500">at {state.readingWpm} WPM</span>
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-1 font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Speaking
          </h3>
          <p className="font-mono text-gray-900 dark:text-gray-100" data-testid="speaking-time">
            {formatDuration(stats.speakSeconds)}{' '}
            <span className="text-gray-500">at {state.speakingWpm} WPM</span>
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-1 font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Words
          </h3>
          <p className="font-mono text-gray-900 dark:text-gray-100" data-testid="word-extremes">
            {hasText
              ? `longest: ${stats.extremes.longest} · shortest: ${stats.extremes.shortest}`
              : '—'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={state.showParagraphBreakdown}
            onChange={(e) => update({ showParagraphBreakdown: e.target.checked })}
            data-testid="toggle-breakdown"
          />
          Show per-paragraph breakdown
        </label>
        {state.showParagraphBreakdown ? (
          countParagraphs(state.text) > 0 ? (
            <table className="mt-3 w-full text-xs" data-testid="paragraph-table">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="py-1 pr-2">#</th>
                  <th className="py-1 pr-2">Preview</th>
                  <th className="py-1 pr-2 text-right">Words</th>
                  <th className="py-1 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row) => (
                  <tr key={row.index} className="border-t border-gray-200 dark:border-gray-800">
                    <td className="py-1 pr-2 font-mono">{row.index}</td>
                    <td className="py-1 pr-2 text-gray-700 dark:text-gray-300">{row.preview}</td>
                    <td className="py-1 pr-2 text-right font-mono">{row.words}</td>
                    <td className="py-1 text-right font-mono">{formatDuration(row.seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p
              className="mt-2 text-xs text-gray-500 dark:text-gray-400"
              data-testid="paragraph-empty"
            >
              No paragraphs yet.
            </p>
          )
        ) : null}
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          History
        </h3>
        {state.history.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400" data-testid="history-empty">
            No saved estimates yet.
          </p>
        ) : (
          <ul className="space-y-1" data-testid="history-list">
            {state.history.map((entry, i) => (
              <li
                key={`${entry.createdAt}-${i}`}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-700 dark:border-gray-800 dark:text-gray-300"
              >
                {entry.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        All analysis runs locally in your browser; nothing is uploaded.
      </p>
    </div>
  );
};
