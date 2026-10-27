/* The squad's table: they chat while you're here, a Hop you tap says
   something, and the red button starts the night if you HOLD it — in the
   app it is held, not tapped, and pressing only says why.

   Holding drums the table (the app's START: press-or-hold, with drums).
   When the ring closes you're taken to the alpha. A keyboard's Enter goes
   straight there: it can't hold. */

import { hop, pick, reducedMotion, replay, whileVisible } from '../lib/motion.js';
import { play, warm } from '../lib/sound.js';
import { isTalking, talk } from '../lib/talk.js';

const HOLD_MS = 1100;
const DRUM_EVERY_MS = 150;
const BANTER_MS = [2600, 5200];
const DRUMS = ['drum_hand_1.wav', 'drum_hand_2.wav', 'drum_hand_3.wav'];

export default function table(root) {
  const seats = new Map([...root.querySelectorAll('[data-seat]')].map((seat) => [seat.dataset.seat, seat]));
  const lines = [...root.querySelector('template[data-banter]').content.querySelectorAll('p')]
    .map((p) => ({ by: p.dataset.by, text: p.textContent.trim() }))
    .filter((line) => seats.has(line.by));

  // Breathing, each on his own beat.
  for (const seat of seats.values()) {
    const svg = seat.querySelector('.hop');
    svg.classList.add('hop--idle');
    svg.style.setProperty('--idle-delay', `${(-Math.random() * 3).toFixed(2)}s`);
  }

  banter(root, seats, lines);
  seatTaps(seats, lines);
  holdToStart(root, seats);
}

// ── What they say while you're here ─────────────────────────────────────

function banter(root, seats, lines) {
  let timer = 0;
  let last = null;
  let visible = false;

  function next() {
    const free = lines.filter((line) => line.by !== last && !isTalking(seats.get(line.by)));
    if (free.length) {
      const line = pick(free);
      last = line.by;
      talk(seats.get(line.by), line.text);
    }
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    if (!visible || document.hidden) return;
    const [min, max] = BANTER_MS;
    timer = setTimeout(next, min + Math.random() * (max - min));
  }

  whileVisible(root, (now) => {
    visible = now;
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
}

function seatTaps(seats, lines) {
  for (const [name, seat] of seats) {
    const button = seat.querySelector('.seat__hop');
    // "You" has his own temper (modules/mash.js).
    if (button.dataset.module?.includes('mash')) continue;
    const theirs = lines.filter((line) => line.by === name);
    button.addEventListener('click', () => {
      if (theirs.length) talk(seat, pick(theirs).text);
      else hop(seat.querySelector('.hop'));
    });
  }
}

// ── START ───────────────────────────────────────────────────────────────

function holdToStart(root, seats) {
  const start = root.querySelector('[data-hold]');
  const hint = root.querySelector('.table__hint');
  const hintText = hint.innerHTML;
  const hops = [...seats.values()].map((seat) => seat.querySelector('.hop'));
  const youSeat = seats.get('You');

  let down = 0;
  let frame = 0;
  let drums = 0;
  let holdTimer = 0;
  let done = false;
  let hintTimer = 0;

  const set = (progress) => start.style.setProperty('--hold', progress.toFixed(3));

  function drumming(on) {
    for (const svg of hops) svg.classList.toggle('is-drumming', on && !reducedMotion());
    start.classList.toggle('is-holding', on);
    clearInterval(drums);
    if (on) {
      play(pick(DRUMS), 0.45);
      drums = setInterval(() => play(pick(DRUMS), 0.45), DRUM_EVERY_MS);
    }
  }

  // The ring is drawn frame by frame; the hold itself is ended by a timer,
  // so it ends on time even where frames are held back.
  function step(now) {
    set(Math.min(1, (now - down) / HOLD_MS));
    frame = requestAnimationFrame(step);
  }

  function finish() {
    done = true;
    cancelAnimationFrame(frame);
    set(1);
    drumming(false);
    hops.forEach((svg) => hop(svg));
    if (youSeat) talk(youSeat, "LET'S GOOO", 1500);
    setTimeout(() => {
      window.location.href = start.href;
    }, reducedMotion() ? 0 : 520);
  }

  function release() {
    if (!down || done) return;
    cancelAnimationFrame(frame);
    clearTimeout(holdTimer);
    const held = performance.now() - down;
    down = 0;
    drumming(false);
    // Let go early: the glass falls shut again.
    const from = Number(start.style.getPropertyValue('--hold')) || 0;
    const t0 = performance.now();
    const fall = (now) => {
      const p = Math.max(0, from * (1 - (now - t0) / 220));
      set(p);
      if (p > 0) frame = requestAnimationFrame(fall);
    };
    frame = requestAnimationFrame(fall);
    // A tap, not a hold: say how.
    if (held < 400) {
      hint.innerHTML = 'Hold it. <strong>Like you mean it.</strong>';
      replay(hint, 'is-nudging');
      clearTimeout(hintTimer);
      hintTimer = setTimeout(() => { hint.innerHTML = hintText; }, 2200);
    }
  }

  start.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || done) return;
    event.preventDefault();
    // Held even if the finger slides off the button a little.
    try {
      start.setPointerCapture(event.pointerId);
    } catch {
      /* Not capturable: letting go outside it ends the hold, that's all. */
    }
    warm(...DRUMS);
    cancelAnimationFrame(frame);
    down = performance.now();
    drumming(true);
    frame = requestAnimationFrame(step);
    holdTimer = setTimeout(finish, HOLD_MS);
  });
  start.addEventListener('pointerup', release);
  start.addEventListener('pointercancel', release);
  start.addEventListener('lostpointercapture', release);
  start.addEventListener('contextmenu', (event) => event.preventDefault());

  // A pointer's click is the hold's business; Enter (a click with no
  // pointer, detail 0) is let through to the link.
  start.addEventListener('click', (event) => {
    if (event.detail !== 0) event.preventDefault();
  });
}
