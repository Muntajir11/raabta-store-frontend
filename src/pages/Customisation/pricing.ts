/** Oversized T-shirt price chart 2026 — blank + per-print surcharges (Rs.) */

export const BLANK_PRICE_BY_GSM = {
  180: 299,
  210: 329,
  240: 349,
} as const;

export type GsmTier = keyof typeof BLANK_PRICE_BY_GSM;

export const PRINT_SIZE_SURCHARGE = {
  S: 49,
  M: 99,
  L: 149,
  XL: 199,
} as const;

export type PrintSizeCode = keyof typeof PRINT_SIZE_SURCHARGE;

export const PRINT_SIZE_OPTIONS: { code: PrintSizeCode; label: string; inches: string }[] = [
  { code: 'S', label: 'Small Print 5" x 5" inch', inches: '5" x 5"' },
  { code: 'M', label: 'Medium Print 8" x 12" inch', inches: '8" x 12"' },
  { code: 'L', label: 'Large Print 12" x 15" inch', inches: '12" x 15"' },
  { code: 'XL', label: 'Extra Large Print 15" x 18" inch', inches: '15" x 18"' },
];

/** Full line for dropdowns and receipts, e.g. Small Print 5" x 5" inch (+ Rs. 49) */
export function printSizeChoiceLabel(code: PrintSizeCode): string {
  const row = PRINT_SIZE_OPTIONS.find((o) => o.code === code);
  if (!row) return code;
  return `${row.label} (+ Rs. ${PRINT_SIZE_SURCHARGE[code]})`;
}

export function blankPriceRs(gsm: number): number {
  const g = gsm as GsmTier;
  return BLANK_PRICE_BY_GSM[g] ?? BLANK_PRICE_BY_GSM[240];
}

export function printSurchargeRs(code: PrintSizeCode): number {
  return PRINT_SIZE_SURCHARGE[code];
}

export type SidePriceInput = {
  hasPrint: boolean;
  printSize: PrintSizeCode;
};

export function totalCustomTeeRs(gsm: number, sides: SidePriceInput[]): number {
  let total = blankPriceRs(gsm);
  for (const s of sides) {
    if (s.hasPrint) total += printSurchargeRs(s.printSize);
  }
  return total;
}
