/* Every behaviour on the site is a module, asked for by the HTML it works
   on:

       <div class="tv" data-module="tv">…</div>

   is assets/js/modules/tv.js, whose default export is called once with
   that element. An element can name several, space-separated. Adding one:
   write the file, name it in the HTML — nothing here changes, and a page
   loads only the modules it names.

   A few run on every page, whatever its HTML says (EVERYWHERE); they are
   given the <html> element.

   A module that fails is reported and the rest carry on: the page under it
   is complete HTML, so it still works, just with less going on. */

const EVERYWHERE = ['accent', 'eyes', 'reveal'];

// main.js is asked for with ?v=<fingerprint of the scripts> (the build adds
// it). The modules are asked for with the same, so new HTML is never run by
// a module a browser kept from before. (The helpers in lib/ are imported
// plainly: they change rarely, and GitHub Pages lets a browser keep a file
// for ten minutes at most.)
const version = new URL(import.meta.url).search;

function run(name, element) {
  import(`./modules/${name}.js${version}`)
    .then((module) => module.default(element))
    .catch((error) => console.error(`[hopon] the "${name}" module failed`, error));
}

for (const name of EVERYWHERE) run(name, document.documentElement);

for (const element of document.querySelectorAll('[data-module]')) {
  for (const name of element.dataset.module.split(/\s+/).filter(Boolean)) run(name, element);
}
