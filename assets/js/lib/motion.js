/* Time and movement, shared by the modules. */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Whether the visitor asked for less motion. Asked each time, so changing
    the setting takes effect without a reload. */
export const reducedMotion = () => reduced.matches;

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Plays a class-driven CSS animation again from its start, even if it is
    already on (removing and adding in one frame would do nothing). */
export function replay(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  // Its own animation's end, not one of its children's bubbling up.
  const done = (event) => {
    if (event.target !== element) return;
    element.classList.remove(className);
    element.removeEventListener('animationend', done);
  };
  element.addEventListener('animationend', done);
}

/** Hop does a little hop. */
export function hop(svg) {
  if (svg && !reducedMotion()) replay(svg, 'is-hopping');
}

/** Calls [onChange](true/false) as [element] comes into and goes out of
    view, so things that loop can stop when nobody can see them. */
export function whileVisible(element, onChange) {
  const observer = new IntersectionObserver(([entry]) => onChange(entry.isIntersecting), { threshold: 0.05 });
  observer.observe(element);
  return observer;
}

export const pick = (list) => list[Math.floor(Math.random() * list.length)];
