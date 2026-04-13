export function isCloudinaryImageUrl(url: string): boolean {
  const u = (url || '').trim();
  return (
    u.includes('res.cloudinary.com/') &&
    (u.includes('/image/upload/') || u.includes('/image/upload'))
  );
}

/**
 * Insert a Cloudinary transformation string right after `/image/upload/`.
 * If the URL doesn't look like a Cloudinary upload URL, returns original.
 */
export function withCloudinaryTransform(url: string, transform: string): string {
  const u = (url || '').trim();
  if (!isCloudinaryImageUrl(u)) return u;
  const marker = '/image/upload/';
  const idx = u.indexOf(marker);
  if (idx === -1) return u;
  const head = u.slice(0, idx + marker.length);
  const tail = u.slice(idx + marker.length);
  // Avoid double-inserting if a transform already exists at the start.
  if (tail.startsWith(transform + '/')) return u;
  return `${head}${transform}/${tail}`;
}

export function productCardImageUrl(url: string, width: number): string {
  const w = Math.max(1, Math.floor(width));
  return withCloudinaryTransform(url, `c_fill,g_auto,ar_4:5,w_${w},q_auto,f_auto`);
}

