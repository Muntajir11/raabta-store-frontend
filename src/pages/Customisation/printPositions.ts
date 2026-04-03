/** Client print guide: hardcoded slots as % of garment frame (0–100). Tune in this file only. */

export type PrintTemplate = 'front' | 'back' | 'profile-left' | 'profile-right';

export type PrintGroup = 'Front' | 'Back' | 'Sleeves & sides';

export type PrintArea = {
  topPct: number;
  leftPct: number;
  widthPct: number;
  heightPct: number;
};

export type PrintPosition = {
  readonly id: string;
  readonly label: string;
  readonly group: PrintGroup;
  readonly template: PrintTemplate;
  readonly area: PrintArea;
};

export const PRINT_POSITIONS: readonly PrintPosition[] = [
  /* —— Front —— */
  {
    id: 'left-chest',
    label: 'Left chest',
    group: 'Front',
    template: 'front',
    area: { topPct: 24, leftPct: 27, widthPct: 14, heightPct: 14 },
  },
  {
    id: 'right-chest',
    label: 'Right chest',
    group: 'Front',
    template: 'front',
    area: { topPct: 24, leftPct: 59, widthPct: 14, heightPct: 14 },
  },
  {
    id: 'on-pocket',
    label: 'On pocket',
    group: 'Front',
    template: 'front',
    area: { topPct: 31, leftPct: 59, widthPct: 10, heightPct: 12 },
  },
  {
    id: 'above-pocket',
    label: 'Above pocket',
    group: 'Front',
    template: 'front',
    area: { topPct: 24, leftPct: 55, widthPct: 18, heightPct: 8 },
  },
  {
    id: 'lower-left',
    label: 'Lower left',
    group: 'Front',
    template: 'front',
    area: { topPct: 75, leftPct: 29, widthPct: 12, heightPct: 12 },
  },
  {
    id: 'lower-right',
    label: 'Lower right',
    group: 'Front',
    template: 'front',
    area: { topPct: 75, leftPct: 59, widthPct: 12, heightPct: 12 },
  },
  {
    id: 'center-front',
    label: 'Center front',
    group: 'Front',
    template: 'front',
    area: { topPct: 24, leftPct: 30, widthPct: 40, heightPct: 20 },
  },
  {
    id: 'full-front',
    label: 'Full front',
    group: 'Front',
    template: 'front',
    area: { topPct: 27, leftPct: 34, widthPct: 32, heightPct: 40 },
  },

  /* —— Back —— */
  {
    id: 'center-back',
    label: 'Center back',
    group: 'Back',
    template: 'back',
    area: { topPct: 20, leftPct: 32, widthPct: 36, heightPct: 10 },
  },
  {
    id: 'full-back',
    label: 'Full back',
    group: 'Back',
    template: 'back',
    area: { topPct: 25, leftPct: 35, widthPct: 30, heightPct: 42 },
  },
  {
    id: 'top-back',
    label: 'Top back',
    group: 'Back',
    template: 'back',
    area: { topPct: 14, leftPct: 44, widthPct: 12, heightPct: 8 },
  },
  {
    id: 'lower-back',
    label: 'Lower back',
    group: 'Back',
    template: 'back',
    area: { topPct: 73, leftPct: 32, widthPct: 36, heightPct: 10 },
  },
  {
    id: 'vertical-back',
    label: 'Vertical back',
    group: 'Back',
    template: 'back',
    area: { topPct: 20, leftPct: 44, widthPct: 12, heightPct: 56 },
  },
  {
    id: 'lower-back-runoff',
    label: 'Lower back runoff',
    group: 'Back',
    template: 'back',
    area: { topPct: 58, leftPct: 30, widthPct: 40, heightPct: 30 },
  },

  /* —— Sleeves & sides (profile: one side.png; right = mirrored) —— */
  {
    id: 'left-sleeve',
    label: 'Left sleeve',
    group: 'Sleeves & sides',
    template: 'profile-left',
    area: { topPct: 18, leftPct: 30, widthPct: 32, heightPct: 34 },
  },
  {
    id: 'right-sleeve',
    label: 'Right sleeve',
    group: 'Sleeves & sides',
    template: 'profile-right',
    area: { topPct: 18, leftPct: 38, widthPct: 32, heightPct: 34 },
  },
  {
    id: 'left-side',
    label: 'Left side',
    group: 'Sleeves & sides',
    template: 'profile-left',
    area: { topPct: 48, leftPct: 24, widthPct: 46, heightPct: 46 },
  },
  {
    id: 'right-side',
    label: 'Right side',
    group: 'Sleeves & sides',
    template: 'profile-right',
    area: { topPct: 48, leftPct: 28, widthPct: 46, heightPct: 46 },
  },
  {
    id: 'left-runoff',
    label: 'Left runoff',
    group: 'Sleeves & sides',
    template: 'profile-left',
    area: { topPct: 48, leftPct: 24, widthPct: 46, heightPct: 56 },
  },
  {
    id: 'right-runoff',
    label: 'Right runoff',
    group: 'Sleeves & sides',
    template: 'profile-right',
    area: { topPct: 48, leftPct: 28, widthPct: 46, heightPct: 56 },
  },
] as const;

export type PrintPositionId = (typeof PRINT_POSITIONS)[number]['id'];

const byId = Object.fromEntries(PRINT_POSITIONS.map((p) => [p.id, p])) as Record<string, PrintPosition>;

export function getPrintPosition(id: string): PrintPosition | undefined {
  return byId[id];
}

export const PRINT_GROUPS_ORDER: PrintGroup[] = ['Front', 'Back', 'Sleeves & sides'];

export function printPositionsByGroup(): { group: PrintGroup; items: Pick<PrintPosition, 'id' | 'label'>[] }[] {
  return PRINT_GROUPS_ORDER.map((group) => ({
    group,
    items: PRINT_POSITIONS.filter((p) => p.group === group).map((p) => ({ id: p.id, label: p.label })),
  }));
}

export function defaultPrintPositionId(): PrintPositionId {
  return 'center-front';
}
