/* Joining, as a little trip instead of a numbered list: a track with three
   stops — the group, being a tester, in — and Hop standing on yours. Only
   the one thing to do now is on screen.

   Pressing a step's button opens Google's page in a new tab; Hop hops on
   to the next stop as it opens, so the next step is waiting when you come
   back. You can't be seen doing it, so the button is taken as done; if it
   wasn't, the stops are buttons and "already did this" skips ahead.

   How far you got is kept in your browser, for when you come back
   tomorrow. Without scripts, both steps are simply listed. */

import { pick, reducedMotion, replay, wait } from '../lib/motion.js';
import { load, save } from '../lib/storage.js';

const KEY = 'hopon.alpha.at';
const LAST = 2;
const OPEN_THEN_MOVE_MS = 650;

const CHEERS = {
  1: ['Nice. One down.', 'Easy.', 'Smooth.'],
  2: ['G behaviour.', "That's both!", 'Squad up.'],
  back: ['Again? Ok.', 'Back we go.'],
};

export default function journey(section) {
  const track = section.querySelector('.track');
  const stops = [...track.querySelectorAll('[data-stop]')];
  const moves = [...section.querySelectorAll('[data-move]')];
  const runner = track.querySelector('.track__runner');
  const cheer = runner.querySelector('.track__cheer');
  const labels = stops.map((stop) => stop.querySelector('.track__label').textContent);

  track.hidden = false;
  section.querySelectorAll('.move__skip').forEach((skip) => { skip.hidden = false; });

  let at = Math.min(LAST, Math.max(0, Number(load(KEY)) || 0));
  let cheerTimer = 0;

  function render({ moved = false, back = false } = {}) {
    track.style.setProperty('--at', at);
    stops.forEach((stop, i) => {
      stop.classList.toggle('is-done', i < at);
      stop.classList.toggle('is-current', i === at);
      if (i === at) stop.setAttribute('aria-current', 'step');
      else stop.removeAttribute('aria-current');
      const state = i < at ? 'done' : i === at ? 'you are here' : 'next';
      stop.setAttribute('aria-label', `${labels[i]}: ${state}`);
    });
    moves.forEach((move, i) => { move.hidden = i !== at; });
    if (!moved) return;

    replay(moves[at], 'is-entering');
    if (!reducedMotion()) replay(runner, 'is-jumping');
    cheer.textContent = pick(back ? CHEERS.back : CHEERS[at] || CHEERS.back);
    cheer.hidden = false;
    replay(cheer, 'is-popping');
    clearTimeout(cheerTimer);
    cheerTimer = setTimeout(() => { cheer.hidden = true; }, 2000);
  }

  function go(next, { focus = false } = {}) {
    next = Math.min(LAST, Math.max(0, next));
    if (next === at) return;
    const back = next < at;
    at = next;
    save(KEY, at);
    render({ moved: true, back });
    // Someone on a keyboard keeps their place: on the new step's button.
    if (focus) moves[at].querySelector('.move__go')?.focus({ preventScroll: true });
  }

  moves.forEach((move, i) => {
    move.querySelector('.move__go')?.addEventListener('click', async () => {
      if (i >= LAST) return;
      await wait(OPEN_THEN_MOVE_MS);
      go(i + 1);
    });
    move.querySelector('.move__skip')?.addEventListener('click', (event) => {
      const again = event.currentTarget.hasAttribute('data-again');
      go(again ? 0 : i + 1, { focus: true });
    });
  });

  stops.forEach((stop, i) => stop.addEventListener('click', () => go(i, { focus: true })));

  render();
}
