/* The alpha's welcome, played once as the page opens: Hop drops in and
   lands, says "Congratulations.", then "You're officially a G." — and on
   the G his shades come down and the pass gets its stamp.

   The words are typed into place without moving anything: the rest of
   each line is already there, unseen, holding its width. With Reduce
   motion (or no scripts) it is all simply there. */

import { hop, reducedMotion, replay, wait } from '../lib/motion.js';

const LAND_MS = 760;
const TYPE_MS = 42;
const BETWEEN_LINES_MS = 380;

export default async function welcome(section) {
  if (reducedMotion()) return;
  const lines = [...section.querySelectorAll('[data-line]')];
  const svg = section.querySelector('.welcome__hop .hop');
  const stamp = document.querySelector('.pass__stamp');

  const texts = lines.map((line) => line.textContent);
  const typed = lines.map((line) => {
    line.textContent = '';
    const shown = document.createElement('span');
    const rest = document.createElement('span');
    rest.style.visibility = 'hidden';
    line.append(shown, rest);
    return { shown, rest };
  });
  typed.forEach((t, i) => { t.rest.textContent = texts[i]; });

  section.classList.add('is-playing', 'is-landing');

  await wait(LAND_MS);
  section.classList.remove('is-landing');
  section.classList.add('is-talking');

  for (let i = 0; i < lines.length; i++) {
    if (i) await wait(BETWEEN_LINES_MS);
    await type(typed[i], texts[i]);
  }

  // The G.
  section.classList.add('has-shades');
  hop(svg);
  await wait(260);
  if (stamp) {
    stamp.classList.add('is-stamped');
    replay(stamp, 'is-stamping');
  }
}

async function type({ shown, rest }, text) {
  for (let n = 1; n <= text.length; n++) {
    shown.textContent = text.slice(0, n);
    rest.textContent = text.slice(n);
    await wait(text[n - 1] === '.' || text[n - 1] === ',' ? TYPE_MS * 5 : TYPE_MS);
  }
}
