'use client';

import React from 'react';
import { MAX_WPM, MIN_WPM, WPM_PRESETS, type ToolState } from '../types';

interface SidebarProps {
  state: ToolState;
  onChange: (next: ToolState) => void;
}

const wpmInputClass =
  'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100';

export const Sidebar: React.FC<SidebarProps> = ({ state, onChange }) => {
  const update = (patch: Partial<ToolState>) => onChange({ ...state, ...patch });

  const wpmField = (
    key: 'readingWpm' | 'speakingWpm',
    label: string,
    testid: string
  ): React.ReactNode => (
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
      {label} (WPM)
      <input
        type="number"
        min={MIN_WPM}
        max={MAX_WPM}
        value={state[key]}
        onChange={(e) => {
          const parsed = Number.parseInt(e.target.value, 10);
          if (Number.isFinite(parsed)) {
            update({ [key]: Math.min(MAX_WPM, Math.max(MIN_WPM, parsed)) } as Partial<ToolState>);
          }
        }}
        data-testid={testid}
        className={wpmInputClass}
      />
    </label>
  );

  return (
    <div className="p-4 space-y-6 text-sm overflow-y-auto h-full" data-testid="tool-sidebar">
      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Speed presets</h3>
        <div className="flex flex-wrap gap-2">
          {WPM_PRESETS.map((preset) => {
            const activeWpm = preset.mode === 'speak' ? state.speakingWpm : state.readingWpm;
            const active =
              preset.mode !== null &&
              activeWpm === preset.wpm &&
              (preset.mode === 'speak') === (state.mode === 'speak');
            return (
              <button
                key={preset.label}
                type="button"
                data-testid={`preset-${preset.wpm}`}
                aria-pressed={active}
                onClick={() =>
                  preset.mode === 'speak'
                    ? update({ speakingWpm: preset.wpm, mode: 'speak' })
                    : update({ readingWpm: preset.wpm, mode: 'read' })
                }
                className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                  active
                    ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-900/40 dark:text-violet-100'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {wpmField('readingWpm', 'Reading speed', 'reading-wpm')}
        {wpmField('speakingWpm', 'Speaking speed', 'speaking-wpm')}
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Saved estimates</h3>
        <p className="text-xs text-gray-600 dark:text-gray-300" data-testid="sidebar-history-count">
          {state.history.length} entr{state.history.length === 1 ? 'y' : 'ies'} in history
          {state.history.length > 0 ? ' (newest first)' : ''}
        </p>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Share</h3>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Use the toolbar share button to create a URL containing the current text and speeds; open
          it to restore this estimate.
        </p>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">About speeds</h3>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          <li>150 WPM — slow, careful reading</li>
          <li>200 WPM — average adult reading</li>
          <li>300 WPM — fast skimming</li>
          <li>130 WPM — comfortable presentation speech</li>
        </ul>
      </div>
    </div>
  );
};
