import type { ExportFormat } from '@itsjust/core';

export const toolConfig = {
  id: 'word-reading-time-estimator',
  name: 'Word Reading Time Estimator',
  category: 'Text',
  description:
    'Estimates reading and speaking time for any pasted text with WPM control, paragraph breakdown, and shareable state.',
  version: '1.0.0',
  theme: { accent: '#6366f1' },
  ogImage: '/og.svg',
  exportFormats: ['png', 'jpeg', 'webp', 'pdf'] as ExportFormat[],
  features: {
    sidebar: true,
    export: true,
    autoSave: true,
    undoRedo: false,
    darkMode: true,
    statusBar: true,
  },
};

export default toolConfig;
