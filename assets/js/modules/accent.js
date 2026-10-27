/* Every page: the visitor's colour, with the text that reads on it. The
   <head> already set --you before the first paint; this adds --on-accent,
   which needs the luminance worked out. */

import { currentYou, paint } from '../lib/you.js';

export default function accent() {
  paint(currentYou());
}
