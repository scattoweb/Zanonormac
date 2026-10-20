import { $, $$, bump, fill, start } from './ui';

start();

const bar = $('[data-cmpbar]');
const dialog = $<HTMLDialogElement>('[data-cmp-dialog]');
const table = $('[data-cmp-table]');
const i18n = JSON.parse($('[data-cmp-i18n]')?.textContent || '{}') as {
  selN: string; sel1: string; details: string;
  rows: { category: string; year: string; hours: string; location: string; price: string };
};

const boxes = () => $$<HTMLInputElement>('[data-compare]');
const selected = () => boxes().filter((b) => b.checked).map((b) => b.closest<HTMLElement>('[data-machine]')!).filter(Boolean);

function paint() {
  if (!bar) return;
  const cards = selected();
  bar.hidden = cards.length === 0;
  const count = $('[data-cmp-count]', bar)!;
  count.textContent = cards.length === 1 ? i18n.sel1 : fill(i18n.selN, { n: cards.length });
  bump(count);
  $('[data-cmp-names]', bar)!.textContent = cards.length > 1 ? '· ' + cards.map((c) => $('h3', c)?.textContent?.trim()).join(', ') : '';
  const open = $<HTMLButtonElement>('[data-cmp-open]', bar)!;
  open.disabled = cards.length < 2;
}

function cell(tag: 'td' | 'th', content: string | Node) {
  const el = document.createElement(tag);
  if (typeof content === 'string') el.textContent = content; else el.append(content);
  return el;
}

function build() {
  if (!table) return;
  const cards = selected();
  table.replaceChildren();
  const head = document.createElement('thead');
  const hr = document.createElement('tr');
  hr.append(cell('th', ''));
  cards.forEach((c) => {
    const box = document.createElement('div');
    const img = $<HTMLImageElement>('img', c);
    if (img) { const i = document.createElement('img'); i.src = img.currentSrc || img.src; i.alt = ''; box.append(i); }
    const a = document.createElement('a');
    a.href = $<HTMLAnchorElement>('a.card__stretch', c)?.href || '#';
    a.textContent = $('h3', c)?.textContent?.trim() || '';
    a.style.color = 'inherit';
    box.append(a);
    hr.append(cell('th', box));
  });
  head.append(hr);
  const body = document.createElement('tbody');
  const specs = cards.map((c) => ($('.card__specs', c)?.textContent || '').split('·').map((s) => s.trim()));
  const rows: [string, (c: HTMLElement, i: number) => string][] = [
    [i18n.rows.category, (c) => $('.label', c)?.textContent?.trim() || ''],
    [i18n.rows.year, (_, i) => specs[i][0] || ''],
    [i18n.rows.hours, (_, i) => specs[i][1] || ''],
    [i18n.rows.location, (_, i) => specs[i][2] || ''],
    [i18n.rows.price, (c) => `${$('.card__price b', c)?.textContent || ''} ${$('.card__price span', c)?.textContent || ''}`.trim()],
  ];
  rows.forEach(([label, get]) => {
    const tr = document.createElement('tr');
    tr.append(cell('th', label));
    cards.forEach((c, i) => tr.append(cell('td', get(c, i))));
    body.append(tr);
  });
  table.append(head, body);
}

document.addEventListener('change', (e) => { if ((e.target as Element).matches('[data-compare]')) paint(); });
$('[data-cmp-clear]')?.addEventListener('click', () => { boxes().forEach((b) => { b.checked = false; }); paint(); });
$('[data-cmp-open]')?.addEventListener('click', () => { build(); dialog?.showModal(); });
$('[data-cmp-close]')?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
paint();
