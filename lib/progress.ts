/**
 * Analysis progress stage constants.
 * Single source of truth for both backend instrumentation and frontend display.
 */

export type ProgressStage = 'transcript' | 'chapters' | 'summary' | 'finalizing' | 'completed';

export const PROGRESS_PCT: Record<ProgressStage, number> = {
  transcript: 0,
  chapters: 30,
  summary: 70,
  finalizing: 95,
  completed: 100,
};

export const PROGRESS_LABEL: Record<ProgressStage, string> = {
  transcript: 'Fetching transcript...',
  chapters: 'Generating chapters...',
  summary: 'Generating summary...',
  finalizing: 'Finalizing...',
  completed: 'Complete',
};
