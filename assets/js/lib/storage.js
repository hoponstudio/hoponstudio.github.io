/* The visitor's own small things, kept in their browser: their colour, how
   far they got joining the alpha. Storage can be off (a private window,
   blocked site data), so every read and write is allowed to fail — the
   page works the same, it just forgets. */

export function load(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function save(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    /* Forgotten, not broken. */
  }
}

export function forget(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* Nothing to forget. */
  }
}
