/* Tap him too much and he gets upset: the app's tap-mash easter egg
   (MashMeter). Ten quick taps and he's sad; ten more and he's angry,
   in the jacket with the bow tie and the bat. Stop, and he calms down.

       <button data-module="mash">{{> hop … mashable="true" }}</button>

   If his seat has a bubble, he says so. */

import { hop } from '../lib/motion.js';
import { talk } from '../lib/talk.js';

const SAD_AT = 10;
const ANGRY_AT = 20;
// Taps further apart than this aren't mashing.
const GAP_MS = 650;
// Quiet this long and he's himself again.
const CALM_MS = 2400;

export default function mash(button) {
  const svg = button.querySelector('.hop');
  if (!svg) return;
  const resting = svg.dataset.mood;
  const seat = button.closest('[data-seat]');

  let taps = 0;
  let lastTap = 0;
  let calm = 0;

  function mood(name, line) {
    if (svg.dataset.mood === name) return;
    svg.dataset.mood = name;
    if (seat && line) talk(seat, line, 1800);
  }

  button.addEventListener('click', () => {
    const now = performance.now();
    taps = now - lastTap < GAP_MS ? taps + 1 : 1;
    lastTap = now;

    if (taps >= ANGRY_AT) mood('angry', 'THAT. IS. IT.');
    else if (taps >= SAD_AT) mood('sad', 'ow. why');
    if (svg.dataset.mood !== 'angry') hop(svg);

    clearTimeout(calm);
    calm = setTimeout(() => {
      taps = 0;
      if (svg.dataset.mood !== resting) {
        svg.dataset.mood = resting;
        hop(svg);
      }
    }, CALM_MS);
  });
}
