/* Navigation follows the standalone course decks; interactions retain native keys. */
const slides = [...document.querySelectorAll('.slide')];
const progress = document.getElementById('progress');
const counter = document.getElementById('counter');
const previous = document.getElementById('prev');
const next = document.getElementById('next');
const notes = document.getElementById('notes-dialog');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let current = 0;
let ticking = false;
let initialized = false;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
function closestSlide() {
  const middle = scrollY + innerHeight / 2;
  let best = 0, distance = Infinity;
  slides.forEach((slide, i) => {
    const candidate = Math.abs(slide.offsetTop + slide.offsetHeight / 2 - middle);
    if (candidate < distance) { best = i; distance = candidate; }
  });
  return best;
}
function update() {
  current = closestSlide();
  slides.forEach((slide, i) => slide.classList.toggle('is-current', i === current));
  progress.style.width = `${(current + 1) / slides.length * 100}%`;
  counter.textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
  previous.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  const hash = `#${String(current + 1).padStart(2, '0')}`;
  if (location.hash !== hash) history.replaceState(null, '', hash);
  ticking = false;
}
function goTo(index, immediate = false) {
  const target = Math.max(0, Math.min(slides.length - 1, index));
  slides[target].scrollIntoView({ behavior: immediate || reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
}
previous.addEventListener('click', () => goTo(current - 1));
next.addEventListener('click', () => goTo(current + 1));
addEventListener('scroll', () => {
  if (initialized && !ticking) { ticking = true; requestAnimationFrame(update); }
}, { passive: true });
addEventListener('resize', () => { if (initialized) goTo(current, true); });
function fromHash() {
  const requested = Number.parseInt(location.hash.slice(1), 10);
  if (Number.isFinite(requested) && requested >= 1 && requested <= slides.length) goTo(requested - 1, true);
  requestAnimationFrame(() => { initialized = true; update(); });
}
addEventListener('hashchange', fromHash);
addEventListener('load', async () => {
  // Font loading must not move the reader to a neighbouring slide on arrival.
  await document.fonts.ready;
  fromHash();
});
function openNotes() {
  const template = slides[current].querySelector('.speaker-note');
  document.getElementById('notes-content').replaceChildren(template.content.cloneNode(true));
  document.getElementById('notes-title').textContent = slides[current].dataset.title;
  notes.showModal();
}
document.getElementById('notes-close').addEventListener('click', () => notes.close());
addEventListener('keydown', (event) => {
  if (notes.open || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof HTMLElement && event.target.closest('a,button,input,select,textarea,summary,[contenteditable]')) return;
  if (event.key.toLowerCase() === 'n') { event.preventDefault(); openNotes(); }
  if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); goTo(current + 1); }
  if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); goTo(current - 1); }
  if (event.key === 'Home') { event.preventDefault(); goTo(0); }
  if (event.key === 'End') { event.preventDefault(); goTo(slides.length - 1); }
});

const windows = [
  { first: 0, last: 8, text: '2017–2025: index 100 → 114, a rise of 14%.' },
  { first: 3, last: 8, text: '2020–2025: index 70 → 114, a rise of 62.9%. A low baseline changes the impression.' },
  { first: 2, last: 5, text: '2019–2022: index 106 → 105, a fall of 0.9%. The longer context remains visible.' }
];
document.querySelectorAll('[data-window]').forEach(button => {
  button.addEventListener('click', () => {
    const selected = windows[Number(button.dataset.window)];
    document.querySelectorAll('[data-window]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const band = document.getElementById('time-window');
    band.setAttribute('x', String(55 + selected.first * 91));
    band.setAttribute('width', String((selected.last - selected.first) * 91));
    document.getElementById('time-readout').textContent = selected.text;
  });
});
document.querySelectorAll('[data-reveal]').forEach(button => {
  button.addEventListener('click', () => {
    const panel = document.getElementById(button.dataset.reveal);
    panel.hidden = !panel.hidden;
    button.setAttribute('aria-expanded', String(!panel.hidden));
  });
});
