/* The app's own sounds (copied from app/assets/sounds/ into
   assets/sounds/). Only ever played because the visitor did something —
   held the red button — never on their own. */

const loaded = new Map();

export function soundUrl(name) {
  return new URL(`../../sounds/${name}`, import.meta.url).href;
}

export function play(name, volume = 0.5) {
  try {
    const url = soundUrl(name);
    if (!loaded.has(url)) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      loaded.set(url, audio);
    }
    const shot = loaded.get(url).cloneNode();
    shot.volume = volume;
    shot.play().catch(() => {});
  } catch {
    /* No sound is fine. */
  }
}

/** Fetches them ahead, so the first hit isn't late. */
export function warm(...names) {
  for (const name of names) {
    const url = soundUrl(name);
    if (!loaded.has(url)) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      loaded.set(url, audio);
    }
  }
}
