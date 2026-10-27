/* A line over someone's head: the bubble in a seat ([data-bubble]) pops
   up with the words and goes after a while. One bubble says one thing at
   a time; a new line replaces the old. */

import { hop, replay } from './motion.js';

const timers = new WeakMap();

export function isTalking(seat) {
  const bubble = seat.querySelector('[data-bubble]');
  return Boolean(bubble && !bubble.hidden);
}

export function talk(seat, text, ms = 3200) {
  const bubble = seat.querySelector('[data-bubble]');
  if (!bubble) return;
  clearTimeout(timers.get(bubble));
  bubble.textContent = text;
  bubble.hidden = false;
  bubble.classList.remove('is-leaving');
  replay(bubble, 'is-popping');
  hop(seat.querySelector('.hop'));
  timers.set(bubble, setTimeout(() => {
    bubble.classList.add('is-leaving');
    timers.set(bubble, setTimeout(() => {
      bubble.hidden = true;
      bubble.classList.remove('is-leaving');
    }, 220));
  }, ms));
}
