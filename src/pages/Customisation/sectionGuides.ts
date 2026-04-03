import { PRINT_POSITIONS } from './printPositions';
import type { EditorView } from './editor/types';

export const SECTION_VIEWS: EditorView[] = ['front', 'back', 'profile-left', 'profile-right'];

export const SECTION_LABELS: Record<EditorView, string> = {
  front: 'Front',
  back: 'Back',
  'profile-left': 'Left sleeve',
  'profile-right': 'Right sleeve',
};

export type GuideChoice = { id: 'none' | string; label: string };

/** Row B+C (front), Row D (back), Row A split by profile template for each sleeve view */
export function guideChoicesForView(view: EditorView): GuideChoice[] {
  const none: GuideChoice = { id: 'none', label: 'No print' };
  const items = PRINT_POSITIONS.filter((p) => {
    if (view === 'front') return p.group === 'Front';
    if (view === 'back') return p.group === 'Back';
    if (view === 'profile-left') return p.template === 'profile-left';
    return p.template === 'profile-right';
  }).map((p) => ({ id: p.id as string, label: p.label }));
  return [none, ...items];
}
