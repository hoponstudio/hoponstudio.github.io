/* "Type it. The squad hears it." Your line goes over your Hop's head and
   is read out loud, as a typed line is in the app's live room; then
   somebody at the table answers. The browser's own voice reads it, and
   only because you pressed send. */

import { pick } from '../lib/motion.js';
import { talk } from '../lib/talk.js';

const REPLIES = [
  'real',
  'say less',
  'ok captain',
  'facts',
  'W',
  'louder for the back',
  'noted. ignored. noted.',
  'bro what',
  "he's cooking",
  'who taught you that',
];

export default function say(form) {
  form.hidden = false;
  const input = form.querySelector('input');
  const room = form.closest('.room');
  const you = room?.querySelector('[data-seat="You"]');
  const others = [...(room?.querySelectorAll('[data-seat]:not([data-seat="You"])') || [])];
  let reply = 0;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const line = input.value.trim().replace(/\s+/g, ' ');
    if (!line) {
      input.focus();
      return;
    }
    input.value = '';
    if (you) talk(you, line, 3800);
    talk(form, line, 3800);
    speak(line);
    clearTimeout(reply);
    if (others.length) {
      reply = setTimeout(() => talk(pick(others), pick(REPLIES), 2600), 1700 + line.length * 25);
    }
  });
}

function speak(line) {
  if (!('speechSynthesis' in window)) return;
  try {
    const voice = window.speechSynthesis.getVoices().find((v) => /^en(-|_|$)/i.test(v.lang));
    const utterance = new SpeechSynthesisUtterance(line);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || 'en-US';
    // A touch slower than the default, with a little lift: weight, not
    // speed — the app's lesson ("too fast… almost has no weight").
    utterance.rate = 0.95;
    utterance.pitch = 1.15;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    /* Read silently, then. */
  }
}
