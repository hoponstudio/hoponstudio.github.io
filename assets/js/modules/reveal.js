/* Every page: sections marked data-reveal slide up as they come into view
   (base.css draws both states). Once in, they stay. */

export default function reveal() {
  const waiting = document.querySelectorAll('[data-reveal]');
  if (!waiting.length) return;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  waiting.forEach((element) => observer.observe(element));
}
