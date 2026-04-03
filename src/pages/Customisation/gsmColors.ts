/** Colours available by GSM (Price Chart 2026) */

export type ColoursBygsmRow = { label: string; hex: string };

export const COLOURS_BY_GSM: Record<180 | 210 | 240, ColoursBygsmRow[]> = {
  180: [
    { label: 'Black', hex: '#1b1b1d' },
    { label: 'White', hex: '#f7f7f7' },
  ],
  210: [
    { label: 'Black', hex: '#1b1b1d' },
    { label: 'White', hex: '#f7f7f7' },
    { label: 'Lavender', hex: '#e6e6fa' },
    { label: 'Beige', hex: '#f5f5dc' },
    { label: 'Red', hex: '#b91c1c' },
    { label: 'Sage Green', hex: '#9caf88' },
    { label: 'Brown', hex: '#78350f' },
    { label: 'Offwhite', hex: '#faf8f5' },
    { label: 'Orange', hex: '#ea580c' },
    { label: 'Navy', hex: '#1e3a5f' },
  ],
  240: [
    { label: 'Black', hex: '#1b1b1d' },
    { label: 'White', hex: '#f7f7f7' },
    { label: 'Navy', hex: '#1e3a5f' },
    { label: 'Red', hex: '#b91c1c' },
    { label: 'Maroon', hex: '#7f1d1d' },
    { label: 'Off-white', hex: '#faf8f5' },
    { label: 'Beige', hex: '#f5f5dc' },
    { label: 'Lavender', hex: '#e6e6fa' },
    { label: 'Brown', hex: '#78350f' },
    { label: 'Charcoal', hex: '#424853' },
    { label: 'Army Green', hex: '#4d5d3a' },
    { label: 'Powder Blue', hex: '#b0e0e6' },
  ],
};

export function coloursForGsm(gsm: number): ColoursBygsmRow[] {
  const tier = gsm === 180 || gsm === 210 || gsm === 240 ? gsm : 240;
  return COLOURS_BY_GSM[tier];
}

export function normalizeColourLabelForGsm(gsm: number, currentLabel: string): string {
  const list = coloursForGsm(gsm);
  if (list.some((c) => c.label === currentLabel)) return currentLabel;
  return list[0]?.label ?? 'White';
}
