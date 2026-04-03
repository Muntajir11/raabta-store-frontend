import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Image as KImage, Layer, Rect, Stage, Text as KText, Transformer } from 'react-konva';
import type Konva from 'konva';
import { EDITOR_STAGE, GARMENT_FRAME, clampLayerToBounds, fitLayerToBounds } from './constraints';
import type { DesignLayer, EditorView, LayerUpdate, PrintBounds } from './types';

type EditorCanvasProps = {
  activeView: EditorView;
  /** Guide box: artwork stays inside; blue overlay shows this region. */
  imagePrintBounds: PrintBounds;
  /** Full-shirt area: text can drag/resize here (not limited to the guide). */
  textLayerBounds: PrintBounds;
  layers: DesignLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: LayerUpdate) => void;
  templates: Record<EditorView, HTMLImageElement | null>;
  rightMirror: boolean;
};

function useImageNode(src: string | null): HTMLImageElement | null {
  const image = useMemo(() => {
    if (!src) return null;
    const img = new window.Image();
    // Blob/data URLs break with crossOrigin='anonymous' in several browsers (blank after remount).
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = src;
    return img;
  }, [src]);
  return image;
}

type EditableImageProps = {
  layer: Extract<DesignLayer, { type: 'image' }>;
  bounds: { x: number; y: number; width: number; height: number };
  onSelectLayer: (id: string) => void;
  onUpdateLayer: (id: string, patch: LayerUpdate) => void;
  nodeRefs: MutableRefObject<Record<string, Konva.Node | null>>;
};

function EditableImage({ layer, bounds, onSelectLayer, onUpdateLayer, nodeRefs }: EditableImageProps) {
  const layerImage = useImageNode(layer.src);
  return (
    <KImage
      ref={(node) => {
        nodeRefs.current[layer.id] = node;
      }}
      image={layerImage ?? undefined}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation}
      draggable
      onClick={() => onSelectLayer(layer.id)}
      onTap={() => onSelectLayer(layer.id)}
      dragBoundFunc={(pos) => clampLayerToBounds(pos.x, pos.y, layer.width, layer.height, bounds)}
      onDragEnd={(e) => onUpdateLayer(layer.id, { x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        const w = Math.max(24, node.width() * scaleX);
        const h = Math.max(24, node.height() * scaleY);
        const fitted = fitLayerToBounds(node.x(), node.y(), w, h, bounds);
        node.x(fitted.x);
        node.y(fitted.y);
        node.width(fitted.width);
        node.height(fitted.height);
        onUpdateLayer(layer.id, {
          x: fitted.x,
          y: fitted.y,
          width: fitted.width,
          height: fitted.height,
          rotation: node.rotation(),
        });
      }}
    />
  );
}

export function EditorCanvas({
  activeView,
  imagePrintBounds,
  textLayerBounds,
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  templates,
  rightMirror,
}: EditorCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  /** Scale design coords to fit container width (mobile); design space stays 620×700. */
  const [stageScale, setStageScale] = useState(1);

  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Record<string, Konva.Node | null>>({});

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      if (w < 16) return;
      const s = Math.min(Math.max(w / EDITOR_STAGE.width, 0.24), 2);
      setStageScale(s);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('orientationchange', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  const transformerBounds = useMemo(() => {
    const sel = layers.find((l) => l.id === selectedLayerId);
    if (!sel) return imagePrintBounds;
    return sel.type === 'image' ? imagePrintBounds : textLayerBounds;
  }, [layers, selectedLayerId, imagePrintBounds, textLayerBounds]);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const target = selectedLayerId ? nodeRefs.current[selectedLayerId] : null;
    transformer.nodes(target ? [target] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedLayerId, layers]);

  const stageBg = '#ffffff';
  const template = templates[activeView];
  const stageW = EDITOR_STAGE.width * stageScale;
  const stageH = EDITOR_STAGE.height * stageScale;
  const touchAnchors = stageScale < 0.72;

  return (
    <div ref={wrapRef} className="editor-canvas-wrap">
      <Stage
        width={stageW}
        height={stageH}
        scaleX={stageScale}
        scaleY={stageScale}
        className="editor-stage"
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) onSelectLayer(null);
        }}
      >
        <Layer>
          <Rect x={0} y={0} width={EDITOR_STAGE.width} height={EDITOR_STAGE.height} fill={stageBg} />
          {template ? (
            <KImage
              image={template ?? undefined}
              x={GARMENT_FRAME.x}
              y={GARMENT_FRAME.y}
              width={GARMENT_FRAME.width}
              height={GARMENT_FRAME.height}
              scaleX={rightMirror ? -1 : 1}
              offsetX={rightMirror ? GARMENT_FRAME.width : 0}
            />
          ) : null}
          <Rect
            x={imagePrintBounds.x}
            y={imagePrintBounds.y}
            width={imagePrintBounds.width}
            height={imagePrintBounds.height}
            fill="rgba(147, 197, 253, 0.38)"
            stroke="rgba(37, 99, 235, 0.7)"
            strokeWidth={2}
            dash={[8, 6]}
            listening={false}
          />
        </Layer>
        <Layer>
          {layers.map((layer) => {
            if (layer.type === 'image') {
              return (
                <EditableImage
                  key={layer.id}
                  layer={layer}
                  bounds={imagePrintBounds}
                  onSelectLayer={onSelectLayer}
                  onUpdateLayer={onUpdateLayer}
                  nodeRefs={nodeRefs}
                />
              );
            }
            return (
              <KText
                key={layer.id}
                ref={(node) => {
                  nodeRefs.current[layer.id] = node;
                }}
                text={layer.text}
                x={layer.x}
                y={layer.y}
                width={layer.width}
                height={layer.height}
                fontFamily={layer.fontFamily}
                fontSize={layer.fontSize}
                fill={layer.fill}
                fontStyle={layer.fontStyle}
                rotation={layer.rotation}
                align={layer.align}
                verticalAlign={layer.verticalAlign}
                draggable
                onClick={() => onSelectLayer(layer.id)}
                onTap={() => onSelectLayer(layer.id)}
                dragBoundFunc={(pos) =>
                  clampLayerToBounds(pos.x, pos.y, layer.width, layer.height, textLayerBounds)
                }
                onDragEnd={(e) => onUpdateLayer(layer.id, { x: e.target.x(), y: e.target.y() })}
                onTransformEnd={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  node.scaleX(1);
                  node.scaleY(1);
                  const w = Math.max(24, node.width() * scaleX);
                  const h = Math.max(24, node.height() * scaleY);
                  const fitted = fitLayerToBounds(node.x(), node.y(), w, h, textLayerBounds);
                  node.x(fitted.x);
                  node.y(fitted.y);
                  node.width(fitted.width);
                  node.height(fitted.height);
                  onUpdateLayer(layer.id, {
                    x: fitted.x,
                    y: fitted.y,
                    width: fitted.width,
                    height: fitted.height,
                    rotation: node.rotation(),
                  });
                }}
              />
            );
          })}
          <Transformer
            ref={transformerRef}
            rotateEnabled
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            anchorSize={touchAnchors ? 16 : 11}
            anchorCornerRadius={touchAnchors ? 3 : 2}
            rotateAnchorOffset={touchAnchors ? 36 : 50}
            borderStrokeWidth={touchAnchors ? 2.25 : 1.5}
            boundBoxFunc={(_oldBox, newBox) => {
              const fitted = fitLayerToBounds(
                newBox.x,
                newBox.y,
                newBox.width,
                newBox.height,
                transformerBounds,
              );
              return { ...newBox, ...fitted };
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}
