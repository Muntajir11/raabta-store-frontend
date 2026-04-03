import type { DesignByView, DesignLayer } from './types';

function toSerializableLayer(layer: DesignLayer) {
  if (layer.type === 'image') {
    return {
      type: layer.type,
      x: Math.round(layer.x),
      y: Math.round(layer.y),
      width: Math.round(layer.width),
      height: Math.round(layer.height),
      rotation: Math.round(layer.rotation),
      src: layer.src,
    };
  }

  return {
    type: layer.type,
    x: Math.round(layer.x),
    y: Math.round(layer.y),
    width: Math.round(layer.width),
    height: Math.round(layer.height),
    rotation: Math.round(layer.rotation),
    text: layer.text,
    fontFamily: layer.fontFamily,
    fontSize: Math.round(layer.fontSize),
    fill: layer.fill,
    fontStyle: layer.fontStyle,
    align: layer.align,
    verticalAlign: layer.verticalAlign,
  };
}

export function serializeDesign(designByView: DesignByView): string {
  return JSON.stringify(
    {
      front: designByView.front.map(toSerializableLayer),
      back: designByView.back.map(toSerializableLayer),
      profileLeft: designByView['profile-left'].map(toSerializableLayer),
      profileRight: designByView['profile-right'].map(toSerializableLayer),
    },
    null,
    0,
  );
}
