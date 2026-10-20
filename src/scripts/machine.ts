import { $, $$, bindSeg, bump, eur, fill, start } from './ui';

start();

const D = JSON.parse($('#machine-data')?.textContent || '{}') as {
  price: number | null; tan: number; messages: string[]; wa: string; copied: string; share: string;
};

/* ---------- gallery: arrows, thumbnails, swipe, keyboard ---------- */
const stage = $('[data-stage]');
const slides = $$<HTMLImageElement>('[data-slide]');
const thumbs = $$<HTMLButtonElement>('[data-thumb]');
let index = 0;
function show(i: number) {
  if (!slides.length) return;
  index = (i + slides.length) % slides.length;
  slides.forEach((s, k) => s.classList.toggle('on', k === index));
  thumbs.forEach((tb, k) => tb.setAttribute('aria-current', String(k === index)));
  const c = $('[data-counter]');
  if (c) { c.textContent = `${index + 1} / ${slides.length}`; bump(c); }
}
$('[data-prev]')?.addEventListener('click', () => show(index - 1));
$('[data-next]')?.addEventListener('click', () => show(index + 1));
thumbs.forEach((tb) => tb.addEventListener('click', () => show(Number(tb.dataset.thumb))));
if (stage && slides.length > 1) {
  let x0 = 0;
  let y0 = 0;
  stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
  });
  stage.tabIndex = 0;
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  });
}

/* ---------- tabs ---------- */
const tabs = $$<HTMLButtonElement>('[data-tabs] [role="tab"]');
const selectTab = (tab: HTMLButtonElement) => {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = $(`[data-panel="${t.dataset.tab}"]`);
    if (panel) {
      panel.hidden = !on;
      if (on) { panel.classList.remove('fade-up'); void panel.offsetWidth; panel.classList.add('fade-up'); }
    }
  });
};
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', (e) => {
    const next = e.key === 'ArrowRight' ? tabs[(i + 1) % tabs.length] : e.key === 'ArrowLeft' ? tabs[(i - 1 + tabs.length) % tabs.length] : null;
    if (next) { e.preventDefault(); next.focus(); selectTab(next); }
  });
});

/* ---------- financing ---------- */
const fin = $('[data-fin]');
if (fin && D.price) {
  const down = $<HTMLInputElement>('#down', fin)!;
  let term = 48;
  const paint = () => {
    const pct = Number(down.value);
    const financed = D.price! * (1 - pct / 100);
    const r = D.tan / 100 / 12;
    const rata = (financed * r) / (1 - Math.pow(1 + r, -term));
    $('[data-down-out]', fin)!.textContent = `${pct}% · ${eur((D.price! * pct) / 100)}`;
    const out = $('[data-rata]', fin)!;
    out.textContent = eur(rata);
    bump(out);
    const note = $('[data-fin-note]', fin)!;
    note.textContent = fill(note.dataset.template || '', { x: eur(financed) });
  };
  down.addEventListener('input', paint);
  bindSeg($('[data-terms]', fin), (v) => { term = Number(v); paint(); });
  paint();
}

/* ---------- share ---------- */
const share = $<HTMLButtonElement>('[data-share]');
share?.addEventListener('click', async () => {
  const label = $('[data-share-label]', share)!;
  try {
    if (navigator.share && matchMedia('(pointer: coarse)').matches) { await navigator.share({ title: document.title, url: location.href }); return; }
    await navigator.clipboard.writeText(location.href);
    label.textContent = D.copied;
    bump(label);
    setTimeout(() => { label.textContent = D.share; }, 1800);
  } catch { /* share sheet closed or clipboard refused */ }
});

/* ---------- mobile WhatsApp sheet ---------- */
const sheet = $<HTMLDialogElement>('[data-sheet]');
const waBtn = $<HTMLAnchorElement>('[data-sheet-wa]');
$('[data-sheet-open]')?.addEventListener('click', () => sheet?.showModal());
$('[data-sheet-close]')?.addEventListener('click', () => sheet?.close());
sheet?.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
$$<HTMLButtonElement>('[data-msg]').forEach((b) => b.addEventListener('click', () => {
  $$('[data-msg]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  if (waBtn) waBtn.href = `https://wa.me/${D.wa}?text=${encodeURIComponent(D.messages[Number(b.dataset.msg)])}`;
}));
waBtn?.addEventListener('click', () => setTimeout(() => sheet?.close(), 300));
