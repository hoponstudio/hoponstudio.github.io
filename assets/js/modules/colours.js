/* Your colour: the little Hop beside the line you type opens the picker.
   A pick repaints every "You" and every button at once, and is kept —
   "Change it any time", as the app's sign-up says. The picker is the
   control's own [aria-controls]. */

import { hop } from '../lib/motion.js';
import { currentYou, setYou } from '../lib/you.js';

export default function colours(toggle) {
  const panel = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!panel) return;
  const swatches = [...panel.querySelectorAll('[data-colour]')];

  function mark(hex) {
    for (const swatch of swatches) {
      swatch.setAttribute('aria-pressed', String(swatch.dataset.colour.toUpperCase() === hex.toUpperCase()));
    }
  }

  function open(on) {
    panel.hidden = !on;
    toggle.setAttribute('aria-expanded', String(on));
    if (on) (panel.querySelector('[aria-pressed="true"]') || swatches[0]).focus();
  }

  mark(currentYou());

  toggle.addEventListener('click', () => open(panel.hidden));

  for (const swatch of swatches) {
    swatch.addEventListener('click', () => {
      setYou(swatch.dataset.colour);
      mark(swatch.dataset.colour);
      // Everyone who is you hops, so you see who changed.
      document.querySelectorAll('svg.hop[style*="var(--you)"]').forEach((svg) => hop(svg));
    });
  }

  document.addEventListener('click', (event) => {
    if (!panel.hidden && !panel.contains(event.target) && !toggle.contains(event.target)) open(false);
  });
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      open(false);
      toggle.focus();
    }
  });
}
