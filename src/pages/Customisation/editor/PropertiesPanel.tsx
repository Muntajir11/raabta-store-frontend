import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { MIN_LAYER_SIDE } from './constraints';
import { EDITOR_FONT_OPTIONS, parseFontStyle, toFontStyle } from './fontOptions';
import type { ImageLayer, LayerUpdate, PrintBounds, TextLayer } from './types';

/** Preset ink / accent colours for T-shirt text (high contrast + common brand tones) */
const TEXT_FILL_PRESETS = [
  '#111111',
  '#ffffff',
  '#374151',
  '#78716c',
  '#b91c1c',
  '#c2410c',
  '#a16207',
  '#15803d',
  '#0f766e',
  '#0e7490',
  '#1d4ed8',
  '#4338ca',
  '#6d28d9',
  '#a21caf',
  '#be185d',
  '#9f1239',
  '#000000',
  '#fbbf24',
] as const;

type PropertiesPanelProps = {
  imageLayer: ImageLayer | null;
  textLayer: TextLayer | null;
  /** When true, show the Text controls card (only after user picks “Custom text” in the sidebar). */
  showTextSection: boolean;
  printBounds: PrintBounds;
  onUpdateImage: (patch: LayerUpdate) => void;
  onUpdateText: (patch: LayerUpdate) => void;
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function normalizeHex(raw: string): string | null {
  let s = raw.trim();
  if (!s.startsWith('#')) s = `#${s}`;
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    const r = s[1],
      g = s[2],
      b = s[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

function TextColorPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const nativePickerRef = useRef<HTMLInputElement>(null);
  const [hexDraft, setHexDraft] = useState(value);

  useEffect(() => {
    setHexDraft(value);
  }, [value]);

  const commitHex = () => {
    const n = normalizeHex(hexDraft);
    if (n) onChange(n);
    else setHexDraft(value);
  };

  const pickerSafe = /^#[0-9a-fA-F]{6}$/i.test(value) ? value : '#111111';

  return (
    <div className="editor-color-palette">
      <span className="editor-field-label">Colour</span>
      <div className="editor-color-swatches" role="listbox" aria-label="Preset text colours">
        {TEXT_FILL_PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            className={`editor-color-swatch${value.toLowerCase() === c.toLowerCase() ? ' is-active' : ''}${c === '#ffffff' ? ' editor-color-swatch--light' : ''}`}
            style={{ backgroundColor: c }}
            title={c}
            aria-label={`Use colour ${c}`}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
      <div className="editor-color-advanced">
        <input
          ref={nativePickerRef}
          type="color"
          className="editor-color-native"
          value={pickerSafe}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Pick any colour"
        />
        <button type="button" className="editor-color-more-btn" onClick={() => nativePickerRef.current?.click()}>
          Custom colour…
        </button>
        <input
          type="text"
          className="editor-hex-input"
          value={hexDraft}
          spellCheck={false}
          maxLength={7}
          onChange={(e) => setHexDraft(e.target.value)}
          onBlur={() => commitHex()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitHex();
          }}
          aria-label="Hex colour code"
          placeholder="#111111"
        />
      </div>
    </div>
  );
}

function imageControlFields(layer: ImageLayer, b: PrintBounds, onUpdate: (p: LayerUpdate) => void) {
  const maxW = b.width;
  const maxH = b.height;
  return (
    <>
      <label className="editor-slider-label">
        <span className="editor-slider-row">
          Width <span>{Math.round(layer.width)}</span>
        </span>
        <input
          type="range"
          min={MIN_LAYER_SIDE}
          max={maxW}
          step={1}
          value={clamp(layer.width, MIN_LAYER_SIDE, maxW)}
          onChange={(e) => onUpdate({ width: Number(e.target.value) })}
        />
      </label>
      <label className="editor-slider-label">
        <span className="editor-slider-row">
          Height <span>{Math.round(layer.height)}</span>
        </span>
        <input
          type="range"
          min={MIN_LAYER_SIDE}
          max={maxH}
          step={1}
          value={clamp(layer.height, MIN_LAYER_SIDE, maxH)}
          onChange={(e) => onUpdate({ height: Number(e.target.value) })}
        />
      </label>
      <label className="editor-slider-label">
        <span className="editor-slider-row">
          Rotation <span>{Math.round(layer.rotation)}°</span>
        </span>
        <input
          type="range"
          min={-180}
          max={180}
          value={Math.round(layer.rotation)}
          onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
        />
      </label>
    </>
  );
}

function TextControlsBody({
  layer,
  onUpdate,
}: {
  layer: TextLayer;
  onUpdate: (p: LayerUpdate) => void;
}) {
  const { bold, italic } = parseFontStyle(layer.fontStyle);
  const setWeightStyle = (nextBold: boolean, nextItalic: boolean) => {
    onUpdate({ fontStyle: toFontStyle(nextBold, nextItalic) });
  };

  return (
    <>
      <label className="editor-field-block">
        <span className="editor-field-label">Text</span>
        <textarea
          className="editor-textarea-compact"
          rows={3}
          value={layer.text}
          placeholder="Your message…"
          onChange={(e) => onUpdate({ text: e.target.value })}
        />
      </label>

      <label className="editor-field-block">
        <span className="editor-field-label">Font</span>
        <select
          className="editor-select-font"
          value={layer.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
        >
          {EDITOR_FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </select>
      </label>

      <label className="editor-slider-label">
        <span className="editor-slider-row">
          Font size <span>{layer.fontSize}px</span>
        </span>
        <input
          type="range"
          min={10}
          max={120}
          value={layer.fontSize}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
        />
      </label>

      <TextColorPicker value={layer.fill} onChange={(hex) => onUpdate({ fill: hex })} />

      <div className="editor-toggle-row" role="group" aria-label="Text weight and style">
        <label className="editor-checkbox-tile">
          <input type="checkbox" checked={bold} onChange={(e) => setWeightStyle(e.target.checked, italic)} />
          <span>Bold</span>
        </label>
        <label className="editor-checkbox-tile">
          <input type="checkbox" checked={italic} onChange={(e) => setWeightStyle(bold, e.target.checked)} />
          <span>Italic</span>
        </label>
      </div>
    </>
  );
}

export const PropertiesPanel: FC<PropertiesPanelProps> = ({
  imageLayer,
  textLayer,
  showTextSection,
  printBounds,
  onUpdateImage,
  onUpdateText,
}) => {
  const b = printBounds;

  return (
    <div className="editor-properties editor-properties--stack has-layer">
      <section className="editor-prop-card">
        <h4 className="editor-prop-card__title">Image controls</h4>
        <p className="editor-prop-card__hint">Width, height, and rotation. Drag the image on the canvas to move it.</p>
        <div className="editor-prop-card__body">
          {imageLayer ? (
            imageControlFields(imageLayer, b, onUpdateImage)
          ) : (
            <p className="editor-prop-placeholder">Select an image on the canvas to adjust its print size.</p>
          )}
        </div>
      </section>

      {showTextSection ? (
        <section className="editor-prop-card editor-prop-card--accent">
          <h4 className="editor-prop-card__title">Text controls</h4>
          <p className="editor-prop-card__hint">Typography appears after you choose Custom text and enter wording in the sidebar.</p>
          <div className="editor-prop-card__body">
            {textLayer ? (
              <TextControlsBody layer={textLayer} onUpdate={onUpdateText} />
            ) : (
              <p className="editor-prop-placeholder">
                Choose <strong>Custom text</strong> below the artwork section, then type your line in <strong>Your text</strong>.
              </p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
};
