import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, X } from 'lucide-react';
import { authSession } from '../../lib/api';
import { useCart } from '../../lib/cart-context';
import frontUrl from '../../assets/customisation/front.png';
import backUrl from '../../assets/customisation/back.png';
import sideUrl from '../../assets/customisation/side.png';
import printPositionsGuideImg from '../../assets/printPosition/printPositions.png';
import { EditorCanvas } from './editor/EditorCanvas';
import { PropertiesPanel } from './editor/PropertiesPanel';
import { Toolbar } from './editor/Toolbar';
import { getPrintBoundsForGuide, TEXT_PLACEMENT_BOUNDS_BY_VIEW } from './editor/constraints';
import { serializeDesign } from './editor/serialize';
import { useDesignState } from './editor/useDesignState';
import type { EditorView, ImageLayer, TextLayer } from './editor/types';
import { getPrintPosition } from './printPositions';
import type { PrintSizeCode } from './pricing';
import {
  BLANK_PRICE_BY_GSM,
  PRINT_SIZE_OPTIONS,
  blankPriceRs,
  printSizeChoiceLabel,
  totalCustomTeeRs,
} from './pricing';
import { coloursForGsm, normalizeColourLabelForGsm } from './gsmColors';
import { SECTION_LABELS, SECTION_VIEWS, guideChoicesForView } from './sectionGuides';
import './CustomiseDesignPage.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
const GSM_OPTIONS = [180, 210, 240] as const;
const FALLBACK_PRODUCT_IMAGE_URL = 'https://placehold.co/600x700?text=Raabta';

const TEMPLATE_URL: Record<EditorView, string> = {
  front: frontUrl,
  back: backUrl,
  'profile-left': sideUrl,
  'profile-right': sideUrl,
};

type SectionConfig = {
  guidePositionId: string;
  printSize: PrintSizeCode;
  description: string;
  imagePreviewUrl: string | null;
  imageFile: File | null;
  textMode: 'none' | 'custom';
  customText: string;
};

function emptySection(): SectionConfig {
  return {
    guidePositionId: 'none',
    printSize: 'M',
    description: '',
    imagePreviewUrl: null,
    imageFile: null,
    textMode: 'none',
    customText: '',
  };
}

function teeColourTextColor(label: string): string {
  const light = ['White', 'Offwhite', 'Off-white', 'Beige', 'Lavender', 'Powder Blue'];
  return light.some((l) => label.includes(l) || label === 'White') ? '#111827' : '#ffffff';
}

const CustomiseEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [size, setSize] = useState<string>('M');
  const [gsm, setGsm] = useState<(typeof GSM_OPTIONS)[number]>(180);
  const [color, setColor] = useState<string>('White');
  const [sections, setSections] = useState<Record<EditorView, SectionConfig>>({
    front: emptySection(),
    back: emptySection(),
    'profile-left': emptySection(),
    'profile-right': emptySection(),
  });
  const [placing, setPlacing] = useState(false);
  const [printGuideOpen, setPrintGuideOpen] = useState(false);
  const [templateImages, setTemplateImages] = useState<Record<EditorView, HTMLImageElement | null>>({
    front: null,
    back: null,
    'profile-left': null,
    'profile-right': null,
  });

  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  const colourScrollRef = useRef<HTMLDivElement>(null);
  const colourScrollOuterRef = useRef<HTMLDivElement>(null);
  const artworkFileInputRef = useRef<HTMLInputElement>(null);
  const [artworkInputNonce, setArtworkInputNonce] = useState(0);

  useEffect(() => {
    return () => {
      Object.values(sectionsRef.current).forEach((s) => {
        if (s.imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(s.imagePreviewUrl);
      });
    };
  }, []);

  useEffect(() => {
    if (!printGuideOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [printGuideOpen]);

  useEffect(() => {
    if (!printGuideOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPrintGuideOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [printGuideOpen]);

  const getPrintBoundsForView = useCallback(
    (view: EditorView) => getPrintBoundsForGuide(view, sections[view].guidePositionId),
    [sections],
  );

  const getFullShirtBounds = useCallback((view: EditorView) => TEXT_PLACEMENT_BOUNDS_BY_VIEW[view], []);

  const {
    activeView,
    setActiveView,
    designByView,
    activeLayers,
    selectedLayerId,
    setSelectedLayerId,
    selectedLayer,
    updateLayer,
    deleteSelected,
    replaceViewImageWithSingleLayer,
    replaceViewTextLayer,
    removeAllImageLayersForView,
    removeAllTextLayersForView,
    clearViewDesign,
    refitLayersInView,
  } = useDesignState({ image: getPrintBoundsForView, text: getFullShirtBounds });

  const section = sections[activeView];
  const printBounds = useMemo(
    () => getPrintBoundsForGuide(activeView, section.guidePositionId),
    [activeView, section.guidePositionId],
  );
  const textPlacementBounds = useMemo(
    () => TEXT_PLACEMENT_BOUNDS_BY_VIEW[activeView],
    [activeView],
  );
  const colourOptions = useMemo(() => coloursForGsm(gsm), [gsm]);

  const imageTargetLayer = useMemo((): ImageLayer | null => {
    return selectedLayer?.type === 'image' ? selectedLayer : null;
  }, [selectedLayer]);

  const textTargetLayer = useMemo((): TextLayer | null => {
    if (selectedLayer?.type === 'text') return selectedLayer;
    const found = designByView[activeView].find((l) => l.type === 'text');
    return (found as TextLayer) ?? null;
  }, [designByView, activeView, selectedLayer]);

  useEffect(() => {
    setColor((c) => normalizeColourLabelForGsm(gsm, c));
  }, [gsm]);

  useEffect(() => {
    const row = colourScrollRef.current;
    const outer = colourScrollOuterRef.current;
    if (!row || !outer) return;

    const syncScrollFade = () => {
      const { scrollLeft, scrollWidth, clientWidth } = row;
      const overflow = scrollWidth > clientWidth + 1;
      outer.classList.toggle('is-scrollable-left', overflow && scrollLeft > 2);
      outer.classList.toggle('is-scrollable-right', overflow && scrollLeft < scrollWidth - clientWidth - 2);
    };

    syncScrollFade();
    row.addEventListener('scroll', syncScrollFade, { passive: true });
    const ro = new ResizeObserver(syncScrollFade);
    ro.observe(row);
    window.addEventListener('resize', syncScrollFade, { passive: true });
    return () => {
      row.removeEventListener('scroll', syncScrollFade);
      ro.disconnect();
      window.removeEventListener('resize', syncScrollFade);
    };
  }, [gsm]);

  useEffect(() => {
    const entries = (Object.keys(TEMPLATE_URL) as EditorView[]).map((view) => {
      const image = new window.Image();
      image.src = TEMPLATE_URL[view];
      return [view, image] as const;
    });
    setTemplateImages(Object.fromEntries(entries) as Record<EditorView, HTMLImageElement>);
  }, []);

  const priceSides = useMemo(
    () =>
      SECTION_VIEWS.map((v) => ({
        hasPrint: sections[v].guidePositionId !== 'none',
        printSize: sections[v].printSize,
      })),
    [sections],
  );

  const totalRs = useMemo(() => totalCustomTeeRs(gsm, priceSides), [gsm, priceSides]);

  const blankRs = blankPriceRs(gsm);

  const priceBreakdownLines = useMemo(() => {
    const lines: string[] = [`Blank (${gsm} GSM): Rs. ${blankRs}`];
    for (const v of SECTION_VIEWS) {
      const s = sections[v];
      if (s.guidePositionId === 'none') continue;
      const pos = getPrintPosition(s.guidePositionId);
      lines.push(
        `${SECTION_LABELS[v]} — ${pos?.label ?? s.guidePositionId} — ${printSizeChoiceLabel(s.printSize)}`,
      );
    }
    lines.push(`Total: Rs. ${totalRs}`);
    return lines;
  }, [gsm, sections, totalRs, blankRs]);

  const setSectionImageFile = (view: EditorView, file: File) => {
    const newUrl = URL.createObjectURL(file);
    replaceViewImageWithSingleLayer(view, newUrl, view === activeView);
    setSections((prev) => {
      const cur = prev[view];
      const oldUrl = cur.imagePreviewUrl;
      if (oldUrl?.startsWith('blob:')) queueMicrotask(() => URL.revokeObjectURL(oldUrl));
      return {
        ...prev,
        [view]: {
          ...cur,
          imageFile: file,
          imagePreviewUrl: newUrl,
        },
      };
    });
  };

  const onToolbarUpload = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (sections[activeView].guidePositionId === 'none') {
      toast.error('Choose a print position (not “No print”) before uploading artwork for this side.');
      return;
    }
    setSectionImageFile(activeView, file);
  };

  const onSectionFileInput = (view: EditorView, fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (sections[view].guidePositionId === 'none') return;
    setSectionImageFile(view, file);
  };

  /** Clears sidebar file + blob URL only (canvas layers unchanged). */
  const clearSectionImageFileState = (view: EditorView) => {
    setSections((prev) => {
      const cur = prev[view];
      if (cur.imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(cur.imagePreviewUrl);
      return {
        ...prev,
        [view]: { ...cur, imageFile: null, imagePreviewUrl: null },
      };
    });
  };

  const clearSectionArtwork = (view: EditorView) => {
    clearSectionImageFileState(view);
    removeAllImageLayersForView(view);
    if (view === activeView) {
      setSelectedLayerId(null);
      setArtworkInputNonce((n) => n + 1);
    }
  };

  const updateSection = (view: EditorView, patch: Partial<SectionConfig>) => {
    if (patch.guidePositionId === 'none') {
      clearViewDesign(view);
      if (view === activeView) setSelectedLayerId(null);
    }
    setSections((prev) => {
      const next = { ...prev[view], ...patch };
      if (patch.guidePositionId === 'none') {
        if (prev[view].imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(prev[view].imagePreviewUrl);
        next.imageFile = null;
        next.imagePreviewUrl = null;
        next.description = '';
        next.textMode = 'none';
        next.customText = '';
      }
      return { ...prev, [view]: next };
    });
  };

  const handleToolbarAddText = () => {
    const t = section.textMode === 'custom' && section.customText.trim() ? section.customText.trim() : 'Your text';
    updateSection(activeView, { textMode: 'custom', customText: t });
    replaceViewTextLayer(
      activeView,
      { text: t, align: 'center', verticalAlign: 'middle' },
      true,
    );
  };

  const handleDeleteSelected = () => {
    const kind = selectedLayer?.type;
    deleteSelected();
    if (kind === 'text') updateSection(activeView, { textMode: 'none', customText: '' });
    if (kind === 'image') {
      clearSectionImageFileState(activeView);
      setArtworkInputNonce((n) => n + 1);
    }
  };

  function viewHasImageAsset(view: EditorView): boolean {
    const s = sections[view];
    if (s.imageFile) return true;
    return designByView[view].some((l) => l.type === 'image');
  }

  /** This side has something to print: artwork and/or custom text (independent). */
  function viewHasPrintContent(view: EditorView): boolean {
    if (viewHasImageAsset(view)) return true;
    const s = sections[view];
    if (s.textMode === 'custom' && s.customText.trim()) return true;
    return designByView[view].some((l) => l.type === 'text' && l.text.trim());
  }

  const handlePlaceOrder = async () => {
    const missingPrint: string[] = [];
    const missingDescription: string[] = [];
    for (const v of SECTION_VIEWS) {
      if (sections[v].guidePositionId !== 'none' && !viewHasPrintContent(v)) {
        missingPrint.push(SECTION_LABELS[v]);
      }
      if (sections[v].guidePositionId !== 'none' && !sections[v].description.trim()) {
        missingDescription.push(SECTION_LABELS[v]);
      }
    }
    if (missingPrint.length > 0) {
      toast.error(
        `Add artwork and/or custom text for: ${missingPrint.join(', ')} (each print area needs at least one).`,
      );
      return;
    }
    if (missingDescription.length > 0) {
      toast.error(`Add a print description for: ${missingDescription.join(', ')}.`);
      return;
    }

    setPlacing(true);
    const session = await authSession();
    const nameDetail = `Custom T-shirt — Rs. ${totalRs}`;
    const payload = {
      productId: `custom-${Date.now()}`,
      name: nameDetail,
      price: Number((totalRs / 83).toFixed(2)),
      image: FALLBACK_PRODUCT_IMAGE_URL,
      category: 'customisation',
      size,
      color,
      gsm,
      qty: 1,
    };
    if (session) {
      toast('Signed-in order captured. Copy the design summary and attach files when you are ready to fulfil the order.');
      setPlacing(false);
      return;
    }
    try {
      await addItem(payload);
      toast.success('Added to your cart.');
      window.setTimeout(() => navigate('/cart'), 900);
    } catch {
      toast.error('Could not add to cart. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const orderPayloadPreview = useMemo(() => {
    const sides = SECTION_VIEWS.map((v) => {
      const s = sections[v];
      return {
        side: SECTION_LABELS[v],
        guidePositionId: s.guidePositionId,
        guideLabel:
          s.guidePositionId === 'none' ? 'No print' : getPrintPosition(s.guidePositionId)?.label ?? s.guidePositionId,
        printSize: s.guidePositionId === 'none' ? null : s.printSize,
        description: s.description.trim() || null,
        imageFileName: s.imageFile?.name ?? null,
        textMode: s.guidePositionId === 'none' ? null : s.textMode,
        customText: s.textMode === 'custom' ? s.customText.trim() || null : null,
        designLayersJson: JSON.stringify(designByView[v]),
      };
    });
    return JSON.stringify({ gsm, colour: color, garmentSize: size, totalRs, sides }, null, 0);
  }, [sections, designByView, gsm, color, size, totalRs]);

  const summaryLines = useMemo(
    () =>
      [
        `Garment size: ${size}`,
        `Colour: ${color}`,
        `GSM: ${gsm}`,
        ...priceBreakdownLines,
        `---`,
        ...SECTION_VIEWS.flatMap((v) => {
          const s = sections[v];
          const lines = [
            `${SECTION_LABELS[v]}: ${s.guidePositionId === 'none' ? 'No print' : getPrintPosition(s.guidePositionId)?.label ?? s.guidePositionId}`,
          ];
          if (s.guidePositionId !== 'none') {
            lines.push(`  Print size: ${printSizeChoiceLabel(s.printSize)}`);
            if (viewHasImageAsset(v)) {
              lines.push(`  Artwork file: ${s.imageFile?.name ?? '(on canvas)'}`);
            } else if (s.textMode === 'custom' && s.customText.trim()) {
              lines.push(`  Artwork file: (none — text only)`);
            } else {
              lines.push(`  Artwork file: (none)`);
            }
            lines.push(`  Description: ${s.description.trim() || '—'}`);
            lines.push(`  Text: ${s.textMode === 'none' ? 'No text' : s.customText.trim() || '(empty)'}`);
          }
          return lines;
        }),
        `---`,
        `Order payload (for DB): ${orderPayloadPreview}`,
        `Full design JSON: ${serializeDesign(designByView)}`,
      ],
    [size, color, gsm, priceBreakdownLines, sections, orderPayloadPreview, designByView],
  );

  const guideOptions = guideChoicesForView(activeView);

  return (
    <section className="customise-page" aria-labelledby="customise-title">
      <div className="container customise-inner">
        <div className="customise-toolbar">
          <Link to="/category/customisation" className="customise-back">
            <ArrowLeft size={18} aria-hidden />
            Customisation
          </Link>
        </div>
        <header className="customise-header">
          <h1 id="customise-title">Design your T-shirt</h1>
          <p className="customise-lede">
            Your total combines the blank garment with each print area you enable. For every side you want printed,
            pick a guide position and print size, upload your artwork, and leave a short note for production. Use the
            print position guide to line up your design with our placement chart.
          </p>
        </header>
        <div className="customise-layout">
          <div className="customise-preview-card">
            <Toolbar
              onAddImage={onToolbarUpload}
              onAddText={handleToolbarAddText}
              onDelete={handleDeleteSelected}
              canDelete={!!selectedLayerId}
            />
            <div className="customise-preview-body">
              <EditorCanvas
                activeView={activeView}
                imagePrintBounds={printBounds}
                textLayerBounds={textPlacementBounds}
                layers={activeLayers}
                selectedLayerId={selectedLayerId}
                onSelectLayer={setSelectedLayerId}
                onUpdateLayer={updateLayer}
                templates={templateImages}
                rightMirror={activeView === 'profile-right'}
              />
            </div>
          </div>
          <div className="customise-controls">
            <div className="customise-field">
              <span className="customise-label">Print area</span>
              <div className="editor-print-position-row" role="tablist" aria-label="Print area">
                {SECTION_VIEWS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="tab"
                    className={`editor-print-tab${activeView === v ? ' active' : ''}`}
                    aria-selected={activeView === v}
                    onClick={() => {
                      setSelectedLayerId(null);
                      setActiveView(v);
                    }}
                  >
                    {SECTION_LABELS[v]}
                  </button>
                ))}
              </div>
            </div>

            <div className="customise-field editor-section-panel">
              <span className="customise-label">{SECTION_LABELS[activeView]} — layout</span>
              <label className="customise-label subtle" htmlFor={`guide-${activeView}`}>
                Where to print (guide)
              </label>
              <div className="editor-guide-row">
                <div className="customise-select-wrap editor-guide-select">
                  <select
                    id={`guide-${activeView}`}
                    className="customise-select"
                    value={section.guidePositionId}
                    onChange={(e) => {
                      const id = e.target.value;
                      updateSection(activeView, { guidePositionId: id });
                      refitLayersInView(activeView);
                    }}
                  >
                    {guideOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="editor-print-guide-trigger"
                  onClick={() => setPrintGuideOpen(true)}
                >
                  Print position guide
                </button>
              </div>
              {section.guidePositionId !== 'none' ? (
                <>
                  <label className="customise-label subtle" htmlFor={`size-${activeView}`}>
                    Print size (add-on)
                  </label>
                  <div className="customise-select-wrap">
                    <select
                      id={`size-${activeView}`}
                      className="customise-select"
                      value={section.printSize}
                      onChange={(e) =>
                        updateSection(activeView, { printSize: e.target.value as PrintSizeCode })
                      }
                    >
                      {PRINT_SIZE_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {printSizeChoiceLabel(opt.code)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="customise-label subtle" htmlFor={`art-${activeView}`}>
                    Print artwork (optional)
                  </label>
                  <div className="editor-section-file-row">
                    <input
                      ref={artworkFileInputRef}
                      key={`artwork-${activeView}-${artworkInputNonce}`}
                      id={`art-${activeView}`}
                      type="file"
                      accept="image/*"
                      className="editor-artwork-file-input-hidden"
                      aria-label="Choose print artwork file"
                      onChange={(e) => onSectionFileInput(activeView, e.target.files)}
                    />
                    <button
                      type="button"
                      className="editor-choose-file-btn"
                      onClick={() => artworkFileInputRef.current?.click()}
                    >
                      {section.imageFile ? 'Change file' : 'Choose file'}
                    </button>
                    <span
                      className="editor-artwork-filename"
                      title={
                        section.imageFile?.name ??
                        (designByView[activeView].some((l) => l.type === 'image')
                          ? 'Artwork on canvas'
                          : undefined)
                      }
                    >
                      {section.imageFile
                        ? section.imageFile.name
                        : designByView[activeView].some((l) => l.type === 'image')
                          ? 'On canvas (add a file if you have one)'
                          : 'No file yet'}
                    </span>
                    {section.imageFile || designByView[activeView].some((l) => l.type === 'image') ? (
                      <button
                        type="button"
                        className="editor-remove-artwork-btn"
                        onClick={() => clearSectionArtwork(activeView)}
                        aria-label="Remove artwork for this side"
                      >
                        <Trash2 size={18} aria-hidden />
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <p className="customise-mini-note">
                    Add a graphic if you want one — or use <strong>Custom text</strong> only. Each print area needs at
                    least <strong>artwork and/or text</strong> before checkout.
                  </p>
                </>
              ) : (
                <p className="customise-mini-note">
                  You can add <strong>Custom text</strong> below anytime. Choose a print position when you are ready for
                  artwork, sizing, and pricing on this side.
                </p>
              )}

              <fieldset className="editor-text-fieldset">
                <legend className="customise-label subtle">Text on this side</legend>
                <div className="editor-text-mode-row" role="radiogroup" aria-label="Text on this side">
                  <label className="editor-text-radio">
                    <input
                      type="radio"
                      name={`text-mode-${activeView}`}
                      checked={section.textMode === 'none'}
                      onChange={() => {
                        updateSection(activeView, { textMode: 'none', customText: '' });
                        removeAllTextLayersForView(activeView);
                      }}
                    />
                    No text
                  </label>
                  <label className="editor-text-radio">
                    <input
                      type="radio"
                      name={`text-mode-${activeView}`}
                      checked={section.textMode === 'custom'}
                      onChange={() => {
                        const t = section.customText.trim() || 'Your text';
                        updateSection(activeView, { textMode: 'custom', customText: t });
                        replaceViewTextLayer(
                          activeView,
                          { text: t, align: 'center', verticalAlign: 'middle' },
                          false,
                        );
                      }}
                    />
                    Custom text
                  </label>
                </div>
                {section.textMode === 'custom' ? (
                  <>
                    <label className="customise-label subtle" htmlFor={`shirt-text-${activeView}`}>
                      Your text
                    </label>
                    <input
                      id={`shirt-text-${activeView}`}
                      type="text"
                      className="customise-input-text"
                      placeholder="Type what should appear on the shirt"
                      value={section.customText}
                      maxLength={200}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateSection(activeView, { customText: v, textMode: 'custom' });
                        if (!v.trim()) {
                          removeAllTextLayersForView(activeView);
                          return;
                        }
                        const existingText = designByView[activeView].find((l) => l.type === 'text');
                        if (existingText) {
                          updateLayer(existingText.id, { text: v });
                        } else {
                          replaceViewTextLayer(
                            activeView,
                            { text: v, align: 'center', verticalAlign: 'middle' },
                            false,
                          );
                        }
                      }}
                    />
                  </>
                ) : null}
              </fieldset>

              {section.guidePositionId !== 'none' ? (
                <>
                  <label className="customise-label subtle" htmlFor={`desc-${activeView}`}>
                    Description for this area (required)
                  </label>
                  <textarea
                    id={`desc-${activeView}`}
                    className="customise-textarea"
                    rows={3}
                    maxLength={1200}
                    required={section.guidePositionId !== 'none'}
                    placeholder="Describe colours, exact text, and anything else we should know for this print."
                    value={section.description}
                    onChange={(e) => updateSection(activeView, { description: e.target.value })}
                  />
                </>
              ) : null}
            </div>

            <div className="customise-field">
              <span className="customise-label">Design tools</span>
              <PropertiesPanel
                imageLayer={imageTargetLayer}
                textLayer={textTargetLayer}
                showTextSection={section.textMode === 'custom'}
                printBounds={printBounds}
                onUpdateImage={(patch) => {
                  if (selectedLayer?.type === 'image') updateLayer(selectedLayer.id, patch);
                }}
                onUpdateText={(patch) => {
                  if (patch.text !== undefined) {
                    const raw = patch.text;
                    if (!raw.trim()) {
                      removeAllTextLayersForView(activeView);
                      updateSection(activeView, { customText: raw, textMode: 'custom' });
                      return;
                    }
                    updateSection(activeView, { customText: raw, textMode: 'custom' });
                  }
                  if (textTargetLayer) updateLayer(textTargetLayer.id, patch);
                }}
              />
            </div>
            <div className="customise-field">
              <span className="customise-label">Tshirt size</span>
              <div className="customise-chip-row">
                {SIZES.map((itemSize) => (
                  <button
                    key={itemSize}
                    type="button"
                    className={`customise-chip${size === itemSize ? ' active' : ''}`}
                    onClick={() => setSize(itemSize)}
                  >
                    {itemSize}
                  </button>
                ))}
              </div>
            </div>
            <div className="customise-field">
              <span className="customise-label">Tshirt colour</span>
              <div className="customise-colour-scroll-outer" ref={colourScrollOuterRef}>
                <div className="customise-colour-scroll-row" ref={colourScrollRef}>
                {colourOptions.map((itemColor) => {
                  const selected = color === itemColor.label;
                  return (
                    <button
                      key={itemColor.label}
                      type="button"
                      className={`customise-chip colour customise-colour-chip${selected ? ' active' : ''}`}
                      onClick={() => setColor(itemColor.label)}
                      aria-pressed={selected}
                      style={
                        selected
                          ? {
                              backgroundColor: itemColor.hex,
                              color: teeColourTextColor(itemColor.label),
                              borderColor: itemColor.label === 'White' ? '#d1d5db' : itemColor.hex,
                            }
                          : undefined
                      }
                    >
                      {!selected ? (
                        <span className="customise-swatch" style={{ backgroundColor: itemColor.hex }} aria-hidden />
                      ) : null}
                      {itemColor.label}
                    </button>
                  );
                })}
                </div>
              </div>
            </div>
            <div className="customise-field">
              <span className="customise-label">T-shirt quality (GSM)</span>
              <div className="customise-select-wrap">
                <select
                  className="customise-select"
                  value={gsm}
                  onChange={(e) => setGsm(Number(e.target.value) as (typeof GSM_OPTIONS)[number])}
                  aria-label="T-shirt GSM option"
                >
                  {GSM_OPTIONS.map((gsmValue) => (
                    <option key={gsmValue} value={gsmValue}>
                      {gsmValue} GSM (blank Rs. {BLANK_PRICE_BY_GSM[gsmValue as 180 | 210 | 240]})
                    </option>
                  ))}
                </select>
              </div>
              <p className="customise-mini-note">
                Fabric: 180/210/240 GSM 100% cotton, premium biowash. Print add-ons: S +49, M +99, L +149, XL +199 per
                printed area.
              </p>
            </div>
            <div className="customise-order-panel">
              <div className="editor-price-breakdown">
                {priceBreakdownLines.map((line) => (
                  <div key={line} className="editor-price-line">
                    {line}
                  </div>
                ))}
              </div>
              <div className="customise-price-row">
                <span>Total</span>
                <strong>Rs. {totalRs}</strong>
              </div>
              <button
                type="button"
                className="customise-place-order"
                onClick={() => void handlePlaceOrder()}
                disabled={placing}
              >
                {placing ? 'Placing...' : 'Place order'}
              </button>
              <button
                type="button"
                className="customise-secondary-btn"
                onClick={() => {
                  void navigator.clipboard.writeText(summaryLines.join('\n'));
                  toast.success('Design summary copied to clipboard.');
                }}
              >
                Copy design summary
              </button>
            </div>
          </div>
        </div>
      </div>
      {printGuideOpen
        ? createPortal(
            <div
              className="print-guide-modal-backdrop"
              role="presentation"
              onClick={() => setPrintGuideOpen(false)}
            >
              <div
                className="print-guide-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="print-guide-modal-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="print-guide-modal-header">
                  <h2 id="print-guide-modal-title" className="print-guide-modal-title">
                    Print position guide
                  </h2>
                  <button
                    type="button"
                    className="print-guide-modal-close"
                    aria-label="Close print position guide"
                    onClick={() => setPrintGuideOpen(false)}
                  >
                    <X size={22} strokeWidth={2.25} aria-hidden />
                  </button>
                </div>
                <div className="print-guide-modal-scroll">
                  <img
                    src={printPositionsGuideImg}
                    alt="Raabta print position guide: sleeve, front, and back placement options"
                    className="print-guide-modal-image"
                    decoding="async"
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
};

export default CustomiseEditorPage;
