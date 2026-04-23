import multiavatar from '@multiavatar/multiavatar/esm';

function randomSeed(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function svgToDataUrl(svg: string): string {
  const cleaned = String(svg || '').trim();
  // Encode to avoid breaking characters in data URL.
  return `data:image/svg+xml,${encodeURIComponent(cleaned)}`;
}

export function avatarDataUrlFromSeed(seed: string): string {
  const s = String(seed || '').trim();
  if (!s) return randomAvatarDataUrl();
  const svgCode = multiavatar(s);
  return svgToDataUrl(svgCode);
}

export function randomAvatarDataUrl(): string {
  const svgCode = multiavatar(randomSeed());
  return svgToDataUrl(svgCode);
}

