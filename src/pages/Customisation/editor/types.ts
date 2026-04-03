export type EditorView = 'front' | 'back' | 'profile-left' | 'profile-right';

export type TextAlign = 'left' | 'center' | 'right';
export type TextVerticalAlign = 'top' | 'middle' | 'bottom';

type LayerBase = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export type ImageLayer = LayerBase & {
  type: 'image';
  src: string;
};

export type TextLayer = LayerBase & {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  fontStyle: 'normal' | 'italic' | 'bold' | 'bold italic';
  align: TextAlign;
  verticalAlign: TextVerticalAlign;
};

export type DesignLayer = ImageLayer | TextLayer;

export type DesignByView = Record<EditorView, DesignLayer[]>;

export type LayerUpdate = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  src?: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  fontStyle?: 'normal' | 'italic' | 'bold' | 'bold italic';
  align?: TextAlign;
  verticalAlign?: TextVerticalAlign;
};

export type PrintBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};
