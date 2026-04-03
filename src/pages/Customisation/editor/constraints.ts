import { getPrintPosition, type PrintArea } from '../printPositions';
import type { EditorView, PrintBounds } from './types';

export const EDITOR_STAGE = {
  width: 620,
  height: 700,
} as const;

/** Garment mockup on stage — must match `EditorCanvas` shirt `KImage` x/y/width/height. */
export const GARMENT_FRAME = {
  x: 50,
  y: 30,
  width: 520,
  height: 640,
} as const;

/**
 * Fallback “whole print” region when guide is “No print” or unknown (images). Smaller than the mockup.
 */
export const PRINT_BOUNDS_BY_VIEW: Record<EditorView, PrintBounds> = {
  front: { x: 190, y: 170, width: 240, height: 360 },
  back: { x: 190, y: 170, width: 240, height: 360 },
  /** Wider fallback when guide is “No print” on sleeve views (images). */
  'profile-left': { x: 200, y: 140, width: 220, height: 380 },
  'profile-right': { x: 200, y: 140, width: 220, height: 380 },
};

/** Text can use the full shirt width; only a little top/bottom inset for neckline / hem. */
const TEXT_INSET_Y = 10;

function textBoundsInGarmentFrame(): PrintBounds {
  const { x, y, width, height } = GARMENT_FRAME;
  const iy = TEXT_INSET_Y * 2;
  return {
    x,
    y: y + TEXT_INSET_Y,
    width,
    height: height - iy,
  };
}

/**
 * Large draggable region for **text** on the mockup (almost full garment). Images still use guide slots.
 */
export const TEXT_PLACEMENT_BOUNDS_BY_VIEW: Record<EditorView, PrintBounds> = {
  front: textBoundsInGarmentFrame(),
  back: textBoundsInGarmentFrame(),
  'profile-left': textBoundsInGarmentFrame(),
  'profile-right': textBoundsInGarmentFrame(),
};

function printAreaToStageBounds(area: PrintArea, mirrorX: boolean): PrintBounds {
  const { x: x0, y: y0, width: fw, height: fh } = GARMENT_FRAME;
  let gx = x0 + (area.leftPct / 100) * fw;
  const gy = y0 + (area.topPct / 100) * fh;
  const gw = (area.widthPct / 100) * fw;
  const gh = (area.heightPct / 100) * fh;
  if (mirrorX) {
    gx = x0 + fw - gx - gw;
  }
  return {
    x: Math.round(gx),
    y: Math.round(gy),
    width: Math.max(1, Math.round(gw)),
    height: Math.max(1, Math.round(gh)),
  };
}

/** Printable rectangle for the current guide, in stage coordinates (clamps drag/resize). */
export function getPrintBoundsForGuide(view: EditorView, guidePositionId: string): PrintBounds {
  if (guidePositionId === 'none') {
    return PRINT_BOUNDS_BY_VIEW[view];
  }
  const pos = getPrintPosition(guidePositionId);
  if (!pos || pos.template !== view) {
    return PRINT_BOUNDS_BY_VIEW[view];
  }
  return printAreaToStageBounds(pos.area, view === 'profile-right');
}

export const MIN_LAYER_SIDE = 24;

export function clampLayerToBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  bounds: PrintBounds,
): { x: number; y: number } {
  const maxX = bounds.x + bounds.width - width;
  const maxY = bounds.y + bounds.height - height;
  return {
    x: Math.min(Math.max(x, bounds.x), Math.max(bounds.x, maxX)),
    y: Math.min(Math.max(y, bounds.y), Math.max(bounds.y, maxY)),
  };
}

/** Keep width/height inside the print area, then clamp position (handles resize, not only drag). */
export function fitLayerToBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  bounds: PrintBounds,
): { x: number; y: number; width: number; height: number } {
  let w = Math.max(MIN_LAYER_SIDE, width);
  let h = Math.max(MIN_LAYER_SIDE, height);
  w = Math.min(w, bounds.width);
  h = Math.min(h, bounds.height);
  const pos = clampLayerToBounds(x, y, w, h, bounds);
  return { x: pos.x, y: pos.y, width: w, height: h };
}
