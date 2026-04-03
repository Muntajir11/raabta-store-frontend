import { useMemo, useRef, useState } from 'react';
import { fitLayerToBounds } from './constraints';
import { EDITOR_FONT_OPTIONS } from './fontOptions';
import type {
  DesignByView,
  DesignLayer,
  EditorView,
  LayerUpdate,
  PrintBounds,
  TextAlign,
  TextVerticalAlign,
} from './types';

const EMPTY_DESIGN: DesignByView = {
  front: [],
  back: [],
  'profile-left': [],
  'profile-right': [],
};

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export type PrintBoundsGetter = (view: EditorView) => PrintBounds;

export type DesignBoundsGetters = {
  /** Selected print guide — images must stay inside this box. */
  image: PrintBoundsGetter;
  /** Larger shirt area — text layers can move freely here. */
  text: PrintBoundsGetter;
};

export function useDesignState(bounds: DesignBoundsGetters) {
  const imageBoundsRef = useRef(bounds.image);
  const textBoundsRef = useRef(bounds.text);
  imageBoundsRef.current = bounds.image;
  textBoundsRef.current = bounds.text;

  const boundsForLayer = (layer: DesignLayer, view: EditorView): PrintBounds =>
    layer.type === 'image' ? imageBoundsRef.current(view) : textBoundsRef.current(view);

  const [activeView, setActiveView] = useState<EditorView>('front');
  const [designByView, setDesignByView] = useState<DesignByView>(EMPTY_DESIGN);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const activeLayers = useMemo(() => designByView[activeView], [designByView, activeView]);
  const selectedLayer = useMemo(
    () => activeLayers.find((layer) => layer.id === selectedLayerId) ?? null,
    [activeLayers, selectedLayerId],
  );

  const addImage = (src: string) => {
    const bounds = imageBoundsRef.current(activeView);
    const width = Math.round(bounds.width * 0.45);
    const height = Math.round(bounds.height * 0.35);
    const x = bounds.x + (bounds.width - width) / 2;
    const y = bounds.y + (bounds.height - height) / 2;

    const layer: DesignLayer = {
      id: uid('img'),
      type: 'image',
      src,
      x,
      y,
      width,
      height,
      rotation: 0,
    };

    setDesignByView((prev) => ({ ...prev, [activeView]: [...prev[activeView], layer] }));
    setSelectedLayerId(layer.id);
  };

  /** Replace all text layers on a view with one block positioned from align / verticalAlign. */
  const replaceViewTextLayer = (
    view: EditorView,
    opts: { text: string; align: TextAlign; verticalAlign: TextVerticalAlign },
    selectAfter = false,
  ) => {
    const bounds = textBoundsRef.current(view);
    /** Narrower default box so the layer can drag toward sleeves/edges (wide box locks horizontal range). */
    const w = Math.max(160, Math.min(300, Math.round(bounds.width * 0.38)));
    const h = Math.round(Math.max(44, bounds.height * 0.12));
    const x = bounds.x + (bounds.width - w) / 2;
    const pad = Math.round(bounds.height * 0.06);
    let y = bounds.y + (bounds.height - h) / 2;
    if (opts.verticalAlign === 'top') y = bounds.y + pad;
    if (opts.verticalAlign === 'bottom') y = bounds.y + bounds.height - h - pad;
    const layerId = uid('txt');
    const layer: DesignLayer = {
      id: layerId,
      type: 'text',
      text: opts.text,
      fontFamily: EDITOR_FONT_OPTIONS[0]?.value ?? 'Arial, Helvetica, sans-serif',
      fontSize: 26,
      fill: '#111111',
      fontStyle: 'normal',
      align: opts.align,
      verticalAlign: opts.verticalAlign,
      x,
      y,
      width: w,
      height: h,
      rotation: 0,
    };
    setDesignByView((prev) => ({
      ...prev,
      [view]: [...prev[view].filter((l) => l.type !== 'text'), layer],
    }));
    if (selectAfter) setSelectedLayerId(layerId);
  };

  const removeAllTextLayersForView = (view: EditorView) => {
    setDesignByView((prev) => ({
      ...prev,
      [view]: prev[view].filter((l) => l.type !== 'text'),
    }));
  };

  const updateLayer = (layerId: string, patch: LayerUpdate) => {
    setDesignByView((prev) => ({
      ...prev,
      [activeView]: prev[activeView].map((layer) => {
        if (layer.id !== layerId) return layer;
        const next = { ...layer, ...patch };
        const b = boundsForLayer(next, activeView);
        const fitted = fitLayerToBounds(next.x, next.y, next.width, next.height, b);
        return { ...next, ...fitted };
      }),
    }));
  };

  const deleteSelected = () => {
    if (!selectedLayerId) return;
    setDesignByView((prev) => ({
      ...prev,
      [activeView]: prev[activeView].filter((layer) => layer.id !== selectedLayerId),
    }));
    setSelectedLayerId(null);
  };

  /** One canonical upload image per view: drop old image layers, add a fresh layer (text layers kept). */
  const replaceViewImageWithSingleLayer = (view: EditorView, src: string, selectLayer: boolean) => {
    const layerId = uid('img');
    const bounds = imageBoundsRef.current(view);
    const width = Math.round(bounds.width * 0.45);
    const height = Math.round(bounds.height * 0.35);
    const x = bounds.x + (bounds.width - width) / 2;
    const y = bounds.y + (bounds.height - height) / 2;
    const layer: DesignLayer = {
      id: layerId,
      type: 'image',
      src,
      x,
      y,
      width,
      height,
      rotation: 0,
    };
    setDesignByView((prev) => ({
      ...prev,
      [view]: [...prev[view].filter((l) => l.type !== 'image'), layer],
    }));
    if (selectLayer) setSelectedLayerId(layerId);
  };

  const removeAllImageLayersForView = (view: EditorView) => {
    setDesignByView((prev) => ({
      ...prev,
      [view]: prev[view].filter((l) => l.type !== 'image'),
    }));
  };

  const clearViewDesign = (view: EditorView) => {
    setDesignByView((prev) => ({ ...prev, [view]: [] }));
  };

  /** Clamp all layers on a view into the current printable rect (e.g. after guide change). */
  const refitLayersInView = (view: EditorView) => {
    setDesignByView((prev) => ({
      ...prev,
      [view]: prev[view].map((layer) => {
        const b = boundsForLayer(layer, view);
        const fitted = fitLayerToBounds(layer.x, layer.y, layer.width, layer.height, b);
        return { ...layer, ...fitted };
      }),
    }));
  };

  const bringForward = () => {
    if (!selectedLayerId) return;
    setDesignByView((prev) => {
      const layers = [...prev[activeView]];
      const idx = layers.findIndex((layer) => layer.id === selectedLayerId);
      if (idx === -1 || idx === layers.length - 1) return prev;
      [layers[idx], layers[idx + 1]] = [layers[idx + 1], layers[idx]];
      return { ...prev, [activeView]: layers };
    });
  };

  const sendBackward = () => {
    if (!selectedLayerId) return;
    setDesignByView((prev) => {
      const layers = [...prev[activeView]];
      const idx = layers.findIndex((layer) => layer.id === selectedLayerId);
      if (idx <= 0) return prev;
      [layers[idx], layers[idx - 1]] = [layers[idx - 1], layers[idx]];
      return { ...prev, [activeView]: layers };
    });
  };

  return {
    activeView,
    setActiveView,
    designByView,
    activeLayers,
    selectedLayerId,
    setSelectedLayerId,
    selectedLayer,
    addImage,
    updateLayer,
    deleteSelected,
    bringForward,
    sendBackward,
    replaceViewImageWithSingleLayer,
    replaceViewTextLayer,
    removeAllImageLayersForView,
    removeAllTextLayersForView,
    clearViewDesign,
    refitLayersInView,
  };
}
