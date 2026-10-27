/* The wall screen: it changes channel by itself every few seconds, and the
   remote under it goes back, forward, to a channel, or pauses it.

   Changing channel is the app's flip (ChannelStage): the picture squashes
   to a line, the new one is swapped in at the MIDDLE of that, and it
   opens. With Reduce motion it just changes.

   It holds still while the pointer or focus is on it, while it is off
   screen and while the tab is hidden, and carries on from where it was.
   "Watch" in tonight's guide ([data-tune="<channel>"]) tunes it from
   anywhere on the page. */

import { reducedMotion, whileVisible } from '../lib/motion.js';

const DWELL_MS = 6000;
const FLIP_MS = 420;
const SWAP_AT_MS = 190;
const OSD_MS = 1600;

export default function tv(root) {
  const slides = [...root.querySelectorAll('.tv-slide')];
  if (slides.length < 2) return;
  const remote = root.querySelector('.tv__remote');
  const dots = root.querySelector('.tv__dots');
  const osd = root.querySelector('.tv__osd');
  const pauseKey = root.querySelector('[data-tv="pause"]');

  root.style.setProperty('--tv-dwell', `${DWELL_MS}ms`);
  remote.hidden = false;

  // A slide's name is its title, or its shout — whose <br> is a space.
  const nameOf = (slide) => {
    const title = slide.querySelector('.tv-slide__title, .tv-slide__shout');
    const text = title
      ? [...title.childNodes].map((node) => (node.nodeName === 'BR' ? ' ' : node.textContent)).join('')
      : slide.dataset.channel;
    return text.replace(/\s+/g, ' ').trim();
  };

  const keys = slides.map((slide, i) => {
    slide.setAttribute('aria-label', `${i + 1} of ${slides.length}: ${nameOf(slide)}`);
    const key = document.createElement('button');
    key.type = 'button';
    key.className = 'tv__dot';
    key.setAttribute('aria-label', `Channel ${i + 1}: ${nameOf(slide)}`);
    key.addEventListener('click', () => show(i));
    dots.append(key);
    return key;
  });

  let at = 0;
  let paused = false; // the pause key
  const holds = new Set(); // pointer, focus, off screen, hidden tab
  let timer = 0;
  let remaining = DWELL_MS;
  let since = 0;
  let osdTimer = 0;
  let swapTimer = 0;
  let flipTimer = 0;

  function put(i) {
    slides[at].classList.remove('is-on');
    slides[at].setAttribute('aria-hidden', 'true');
    keys[at].removeAttribute('aria-current');
    at = i;
    slides[at].classList.add('is-on');
    slides[at].removeAttribute('aria-hidden');
    keys[at].setAttribute('aria-current', 'true');
    root.style.setProperty('--tv-glow', getComputedStyle(slides[at]).getPropertyValue('--slide'));
  }

  function show(i, { flip = true } = {}) {
    i = (i + slides.length) % slides.length;
    if (i === at && slides[at].classList.contains('is-on')) {
      restartClock();
      return;
    }
    clearTimeout(swapTimer);
    if (flip && !reducedMotion()) {
      // The class plays the flip on the screen's insides; it comes off by
      // the clock, since the animations end on children, not on the set.
      root.classList.remove('is-switching');
      void root.offsetWidth;
      root.classList.add('is-switching');
      clearTimeout(flipTimer);
      flipTimer = setTimeout(() => root.classList.remove('is-switching'), FLIP_MS);
      swapTimer = setTimeout(() => put(i), SWAP_AT_MS);
    } else {
      put(i);
    }
    // The channel, for a moment, as an old set shows it.
    osd.textContent = `CH ${String(i + 1).padStart(2, '0')}  ${nameOf(slides[i]).toUpperCase()}`;
    osd.classList.add('is-showing');
    clearTimeout(osdTimer);
    osdTimer = setTimeout(() => osd.classList.remove('is-showing'), OSD_MS);
    restartClock();
  }

  // ── The clock ────────────────────────────────────────────────────────
  // Time left on this channel is kept across a hold, so a channel the
  // pointer passed over isn't cut short or shown twice as long. The bar
  // under the screen is a CSS animation of the same length, paused with it.

  function restartClock() {
    remaining = DWELL_MS;
    // The bar starts again with the clock.
    const key = keys[at];
    key.removeAttribute('aria-current');
    void key.offsetWidth;
    key.setAttribute('aria-current', 'true');
    run();
  }

  function run() {
    clearTimeout(timer);
    const still = paused || holds.size > 0;
    root.classList.toggle('is-paused', paused);
    root.classList.toggle('is-held', still && !paused);
    if (still) return;
    since = performance.now();
    timer = setTimeout(() => show(at + 1), remaining);
  }

  function stop() {
    if (timer) remaining = Math.max(400, remaining - (performance.now() - since));
    clearTimeout(timer);
    timer = 0;
  }

  function hold(reason, on) {
    const was = paused || holds.size > 0;
    if (on) holds.add(reason);
    else holds.delete(reason);
    const now = paused || holds.size > 0;
    if (was === now) return;
    if (now) stop();
    run();
  }

  // ── The remote ───────────────────────────────────────────────────────

  root.querySelector('[data-tv="prev"]').addEventListener('click', () => show(at - 1));
  root.querySelector('[data-tv="next"]').addEventListener('click', () => show(at + 1));
  pauseKey.addEventListener('click', () => {
    if (!paused) stop();
    paused = !paused;
    pauseKey.setAttribute('aria-label', paused ? 'Play the screen' : 'Pause the screen');
    run();
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(at - 1);
    if (event.key === 'ArrowRight') show(at + 1);
  });

  // A swipe across the screen changes channel too.
  const screen = root.querySelector('.tv__screen');
  let downX = null;
  screen.addEventListener('pointerdown', (event) => { downX = event.clientX; });
  screen.addEventListener('pointerup', (event) => {
    if (downX === null) return;
    const dx = event.clientX - downX;
    downX = null;
    if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1));
  });

  // ── Holding still ────────────────────────────────────────────────────

  const frame = root.querySelector('.tv__frame');
  frame.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') hold('pointer', true);
  });
  frame.addEventListener('pointerleave', () => hold('pointer', false));
  // Keyboard focus only: a click on the remote focuses its key too, and the
  // screen stopping because you pressed "next" would look broken.
  root.addEventListener('focusin', (event) => {
    if (event.target.matches(':focus-visible')) hold('focus', true);
  });
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) hold('focus', false);
  });
  whileVisible(root, (visible) => hold('offscreen', !visible));
  document.addEventListener('visibilitychange', () => hold('hidden', document.hidden));

  // ── Tonight's guide ──────────────────────────────────────────────────

  for (const button of document.querySelectorAll('[data-tune]')) {
    const i = slides.findIndex((slide) => slide.dataset.channel === button.dataset.tune);
    if (i < 0) continue;
    button.hidden = false;
    button.addEventListener('click', () => {
      root.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
      // Change once it's in view, so the flip is seen.
      setTimeout(() => show(i), reducedMotion() ? 0 : 450);
    });
  }

  slides.forEach((slide, i) => {
    if (i) slide.setAttribute('aria-hidden', 'true');
  });
  put(0);
  restartClock();
}
