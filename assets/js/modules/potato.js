/* The hot potato hanging by the screen (the room's game: pass it before it
   blows). Swat it and it swings; somebody at the table has an opinion. */

import { pick, replay } from '../lib/motion.js';
import { talk } from '../lib/talk.js';

const LINES = ['HOT POTATO', 'who threw that', 'not it', 'pass it pass it', 'it’s gonna blow'];

export default function potato(button) {
  button.addEventListener('click', () => {
    replay(button, 'is-hot');
    const seats = [...document.querySelectorAll('[data-seat]')];
    if (seats.length) talk(pick(seats), pick(LINES), 1800);
  });
}
