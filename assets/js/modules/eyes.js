/* Every page: every Hop watches the pointer, and each blinks on his own
   clock. As in the app (MascotOrb), his eyes follow and he blinks; nothing
   else about him moves unless something asks.

   Only Hops on screen are looked at, and the work is done once a frame at
   most. With Reduce motion they look straight ahead. */

import { reducedMotion } from '../lib/motion.js';

// How far from his middle the pointer must be for his eyes to reach their
// edge, in pixels.
const REACH = 320;
// After this long with the pointer still, the eyes drift back to the middle.
const SETTLE_MS = 3500;

export default function eyes() {
  const hops = [...document.querySelectorAll('svg.hop')];
  if (!hops.length) return;

  // His own blink: a different length and start for each, so a row of
  // Hops never blinks as one.
  for (const svg of hops) {
    svg.style.setProperty('--blink-every', `${(4.2 + Math.random() * 3).toFixed(2)}s`);
    svg.style.setProperty('--blink-delay', `${(Math.random() * 4).toFixed(2)}s`);
  }

  if (reducedMotion()) return;

  const onScreen = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) onScreen.add(entry.target);
      else onScreen.delete(entry.target);
    }
  });
  hops.forEach((svg) => observer.observe(svg));

  let pointer = null;
  let frame = 0;
  let settle = 0;

  function look() {
    frame = 0;
    for (const svg of onScreen) {
      if (!pointer) {
        svg.style.setProperty('--look-x', 0);
        svg.style.setProperty('--look-y', 0);
        continue;
      }
      const box = svg.getBoundingClientRect();
      const dx = pointer.x - (box.left + box.width / 2);
      const dy = pointer.y - (box.top + box.height * 0.6);
      const clamp = (v) => Math.max(-1, Math.min(1, v));
      svg.style.setProperty('--look-x', clamp(dx / REACH).toFixed(3));
      svg.style.setProperty('--look-y', clamp(dy / REACH).toFixed(3));
    }
  }

  const request = () => {
    if (!frame) frame = requestAnimationFrame(look);
  };

  window.addEventListener('pointermove', (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    request();
    clearTimeout(settle);
    settle = setTimeout(() => {
      pointer = null;
      request();
    }, SETTLE_MS);
  }, { passive: true });

  window.addEventListener('scroll', request, { passive: true });
}
