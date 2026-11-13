import { useState } from 'react';

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

/** Tries the official PNG first and falls back to the labelled SVG placeholder. */
export function Logo({ name, alt, className, style }) {
  const [src, setSrc] = useState(`${base}/assets/images/${name}.png`);
  return <img src={src} alt={alt} className={className} style={style} onError={() => { if (!src.endsWith('.svg')) setSrc(`${base}/assets/images/${name}.svg`); }} />;
}
