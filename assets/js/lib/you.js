/* The visitor's colour. In the app the mascot's colour paints the whole
   app; here the colour picked in the room paints the site: "You" wears it,
   and it is every button's accent (--you, read by tokens.css).

   The page's <head> puts a saved colour on before the first paint; this
   keeps the rest in step with it. */

import { load, save } from './storage.js';

const KEY = 'hopon.you';
export const DEFAULT = '#FFC83D';

const isColour = (value) => /^#[0-9a-f]{6}$/i.test(value || '');

export function currentYou() {
  const saved = load(KEY);
  return isColour(saved) ? saved.toUpperCase() : DEFAULT;
}

/** Text on an accent: dark on a light colour, cream on a dark one —
    AppColors.onAccent's rule (luminance over 0.45 takes the ink). */
export function onAccent(hex) {
  const channel = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  return luminance > 0.45 ? 'var(--ink)' : 'var(--cream)';
}

export function paint(hex) {
  const root = document.documentElement.style;
  root.setProperty('--you', hex);
  root.setProperty('--on-accent', onAccent(hex));
}

/** Changes the visitor's colour everywhere, and remembers it. */
export function setYou(hex) {
  if (!isColour(hex)) return;
  paint(hex);
  save(KEY, hex);
  document.dispatchEvent(new CustomEvent('hopon:you', { detail: hex }));
}
