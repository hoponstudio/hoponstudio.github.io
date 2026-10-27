/* A clock that counts up from the moment the page opened: the room's LIVE
   time, how long Jake has been in the toilet.

       <span data-module="ticker" data-from="123" data-sign="+">+2:03</span>

   data-from is where it starts, in seconds; data-sign goes in front. All
   the clocks on a page share one timer. */

const clocks = [];
let started = 0;
let timer = 0;

function format(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

function tick() {
  const elapsed = Math.floor((performance.now() - started) / 1000);
  for (const clock of clocks) clock.element.textContent = clock.sign + format(clock.from + elapsed);
}

export default function ticker(element) {
  if (!started) started = performance.now();
  clocks.push({
    element,
    from: Number(element.dataset.from) || 0,
    sign: element.dataset.sign || '',
  });
  tick();
  if (!timer) timer = setInterval(tick, 1000);
}
