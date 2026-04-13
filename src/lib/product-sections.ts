export const SECTION_NAMES = {
  anime: 'Anime',
  sports: 'Sports',
  streetwear: 'Streetwear',
  customisation: 'Customisation',
  normal: 'Raabta Studio',
  islamic: 'Raabta Lifestyle',
} as const;

export type SectionRouteId = keyof typeof SECTION_NAMES;

export function routeCategoryToSectionName(categoryId: string): string {
  const raw = (categoryId || '').trim();
  if (!raw) return '';
  const key = raw.toLowerCase() as SectionRouteId;
  return SECTION_NAMES[key] ?? (raw.length ? raw : '');
}

