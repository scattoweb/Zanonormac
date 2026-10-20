import { $, $$, bindSeg, bump, cfg, fill, num, reanimate, sendRequest, setBranch, start } from './ui';

start();

const L = JSON.parse($('#cat-data')?.textContent || '{}') as {
  count: string; count1: string; readyShort: string; filters: string; anyShort: string; yearFrom: string; removeF: string;
  onlyReady: string; cNew: string; cUsed: string; savedOk: string; sendError: string;
  groups: Record<string, string>; brands: Record<string, string>; branches: Record<string, string>;
};

const HOURS_MAX = 12000;
const PRICE_MAX = 150000;

interface State {
  q: string; cond: string; ready: boolean; cat: string[]; brand: string[]; branch: string[];
  year: string; hours: number; price: number; sort: string; view: string;
}

const params = new URLSearchParams(location.search);
const list = (k: string) => (params.get(k) || '').split(',').filter(Boolean);
const state: State = {
  q: params.get('q') || '',
  cond: ['nuovo', 'usato'].includes(params.get('cond') || '') ? params.get('cond')! : '',
  ready: params.get('ready') === '1',
  cat: list('cat'), brand: list('brand'), branch: list('branch'),
  year: params.get('year') || '',
  hours: Number(params.get('hours')) || HOURS_MAX,
  price: Number(params.get('price')) || PRICE_MAX,
  sort: params.get('sort') || 'recent',
  view: params.get('view') === 'list' ? 'list' : 'grid',
};

const form = $<HTMLFormElement>('[data-filter-form]')!;
const results = $('[data-results]')!;
const cards = $$('[data-machine]', results);
const q = $<HTMLInputElement>('#q', form)!;
const year = $<HTMLSelectElement>('#year', form)!;
const hours = $<HTMLInputElement>('#hours', form)!;
const price = $<HTMLInputElement>('#price', form)!;
const sort = $<HTMLSelectElement>('#sort')!;
const readySwitch = $<HTMLButtonElement>('[data-ready-switch]')!;
const applyLabel = $('[data-apply-label]')!;
const applyBase = applyLabel.textContent || '';
const boxes = (name: string) => $$<HTMLInputElement>(`input[name="${name}"]`, form);

type Facet = 'q' | 'cond' | 'ready' | 'cat' | 'brand' | 'year' | 'hours' | 'price' | 'branch';
function pass(c: HTMLElement, skip?: Facet) {
  const d = c.dataset;
  if (skip !== 'q' && state.q && !d.name!.includes(state.q.toLowerCase())) return false;
  if (skip !== 'cond' && state.cond && d.cond !== state.cond) return false;
  if (skip !== 'ready' && state.ready && d.status !== 'ready') return false;
  if (skip !== 'cat' && state.cat.length && !state.cat.includes(d.group!)) return false;
  if (skip !== 'brand' && state.brand.length && !state.brand.includes(d.brand!)) return false;
  if (skip !== 'year' && state.year && Number(d.year) < Number(state.year)) return false;
  if (skip !== 'hours' && state.hours < HOURS_MAX && Number(d.hours) > state.hours) return false;
  if (skip !== 'price' && state.price < PRICE_MAX && d.price && Number(d.price) > state.price) return false;
  if (skip !== 'branch' && state.branch.length && !state.branch.includes(d.branch!)) return false;
  return true;
}

const sorters: Record<string, (a: HTMLElement, b: HTMLElement) => number> = {
  recent: (a, b) => Number(b.dataset.added) - Number(a.dataset.added),
  priceAsc: (a, b) => (Number(a.dataset.price) || Infinity) - (Number(b.dataset.price) || Infinity),
  priceDesc: (a, b) => (Number(b.dataset.price) || -1) - (Number(a.dataset.price) || -1),
  hours: (a, b) => Number(a.dataset.hours) - Number(b.dataset.hours),
  year: (a, b) => Number(b.dataset.year) - Number(a.dataset.year),
};

function writeUrl() {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.cond) p.set('cond', state.cond);
  if (state.ready) p.set('ready', '1');
  if (state.cat.length) p.set('cat', state.cat.join(','));
  if (state.brand.length) p.set('brand', state.brand.join(','));
  if (state.branch.length) p.set('branch', state.branch.join(','));
  if (state.year) p.set('year', state.year);
  if (state.hours < HOURS_MAX) p.set('hours', String(state.hours));
  if (state.price < PRICE_MAX) p.set('price', String(state.price));
  if (state.sort !== 'recent') p.set('sort', state.sort);
  if (state.view !== 'grid') p.set('view', state.view);
  const s = p.toString();
  history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
}

function facetCounts(name: 'cat' | 'brand' | 'branch', key: 'group' | 'brand' | 'branch') {
  boxes(name).forEach((b) => {
    const n = cards.filter((c) => c.dataset[key] === b.value && pass(c, name)).length;
    const out = b.parentElement!.querySelector('[data-n]')!;
    if (out.textContent !== String(n)) { out.textContent = String(n); bump(out); }
  });
}

function activeChips() {
  const box = $('[data-active]')!;
  const items: { label: string; clear: () => void }[] = [];
  if (state.q) items.push({ label: `“${state.q}”`, clear: () => { state.q = ''; } });
  if (state.cond) items.push({ label: state.cond === 'nuovo' ? L.cNew : L.cUsed, clear: () => { state.cond = ''; } });
  if (state.ready) items.push({ label: L.onlyReady, clear: () => { state.ready = false; } });
  state.cat.forEach((v) => items.push({ label: L.groups[v] || v, clear: () => { state.cat = state.cat.filter((x) => x !== v); } }));
  state.brand.forEach((v) => items.push({ label: L.brands[v] || v, clear: () => { state.brand = state.brand.filter((x) => x !== v); } }));
  if (state.year) items.push({ label: `${L.yearFrom} ${state.year}`, clear: () => { state.year = ''; } });
  if (state.hours < HOURS_MAX) items.push({ label: `≤ ${num(state.hours)} h`, clear: () => { state.hours = HOURS_MAX; } });
  if (state.price < PRICE_MAX) items.push({ label: `≤ € ${num(state.price)}`, clear: () => { state.price = PRICE_MAX; } });
  state.branch.forEach((v) => items.push({ label: L.branches[v] || v, clear: () => { state.branch = state.branch.filter((x) => x !== v); } }));
  box.replaceChildren();
  box.hidden = items.length === 0;
  items.forEach((it) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip chip--x';
    b.setAttribute('aria-label', `${L.removeF}: ${it.label}`);
    b.innerHTML = '<span></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    b.querySelector('span')!.textContent = it.label;
    b.addEventListener('click', () => { it.clear(); sync(); update(); });
    box.append(b);
  });
  if (items.length > 1) {
    const all = $('[data-reset]')!.cloneNode(true) as HTMLButtonElement;
    all.className = 'textlink';
    all.style.cssText = 'border:0;background:none;cursor:pointer;font-size:13px';
    all.addEventListener('click', reset);
    box.append(all);
  }
  return items.length;
}

const condSeg = bindSeg($('[data-cond]', form), (v) => { state.cond = v; update(); });
const viewSeg = bindSeg($('[data-view]'), (v) => { state.view = v; update(); });

/** Put state into the controls (after URL load, chip removal or reset). */
function sync() {
  q.value = state.q;
  condSeg.set(state.cond);
  viewSeg.set(state.view);
  readySwitch.setAttribute('aria-checked', String(state.ready));
  boxes('cat').forEach((b) => { b.checked = state.cat.includes(b.value); });
  boxes('brand').forEach((b) => { b.checked = state.brand.includes(b.value); });
  boxes('branch').forEach((b) => { b.checked = state.branch.includes(b.value); });
  year.value = state.year;
  hours.value = String(state.hours);
  price.value = String(state.price);
  sort.value = state.sort;
}

function update(animate = true) {
  const visible = cards.filter((c) => pass(c)).sort(sorters[state.sort] || sorters.recent);
  cards.forEach((c) => { c.hidden = !visible.includes(c); });
  visible.forEach((c, i) => { c.style.setProperty('--i', String(i)); results.append(c); });
  results.classList.toggle('list', state.view === 'list');
  if (animate) reanimate(results);

  const n = visible.length;
  const countEl = $('[data-count]')!;
  countEl.textContent = n === 1 ? L.count1 : fill(L.count, { n });
  bump(countEl);
  $('[data-ready]')!.textContent = fill(L.readyShort, { n: visible.filter((c) => c.dataset.status === 'ready').length });
  ($('[data-empty]')!).hidden = n > 0;
  $('[data-hours-out]')!.textContent = state.hours >= HOURS_MAX ? L.anyShort : `≤ ${num(state.hours)} h`;
  $('[data-price-out]')!.textContent = state.price >= PRICE_MAX ? L.anyShort : `≤ € ${num(state.price)}`;
  facetCounts('cat', 'group');
  facetCounts('brand', 'brand');
  facetCounts('branch', 'branch');
  const active = activeChips();
  $('[data-filters-label]')!.textContent = active ? `${L.filters} (${active})` : L.filters;
  applyLabel.textContent = `${applyBase} (${n})`;
  writeUrl();
}

function reset() {
  Object.assign(state, { q: '', cond: '', ready: false, cat: [], brand: [], branch: [], year: '', hours: HOURS_MAX, price: PRICE_MAX });
  sync();
  update();
}

let qTimer = 0;
q.addEventListener('input', () => { clearTimeout(qTimer); qTimer = window.setTimeout(() => { state.q = q.value.trim(); update(); }, 160); });
readySwitch.addEventListener('click', () => { state.ready = !state.ready; readySwitch.setAttribute('aria-checked', String(state.ready)); update(); });
(['cat', 'brand'] as const).forEach((name) => boxes(name).forEach((b) => b.addEventListener('change', () => {
  state[name] = boxes(name).filter((x) => x.checked).map((x) => x.value);
  update();
})));
boxes('branch').forEach((b) => b.addEventListener('change', () => {
  state.branch = boxes('branch').filter((x) => x.checked).map((x) => x.value);
  update();
  // ticking a branch also makes it "your branch"; for Trentino-Alto Adige this switches to German
  if (b.checked) setBranch(b.value);
}));
year.addEventListener('change', () => { state.year = year.value; update(); });
hours.addEventListener('input', () => { state.hours = Number(hours.value); update(false); });
price.addEventListener('input', () => { state.price = Number(price.value); update(false); });
hours.addEventListener('change', () => reanimate(results));
price.addEventListener('change', () => reanimate(results));
sort.addEventListener('change', () => { state.sort = sort.value; update(); });
$$('[data-reset]').forEach((b) => b.addEventListener('click', reset));

// mobile filter sheet
const panel = $('[data-filters]')!;
const opener = $<HTMLButtonElement>('[data-filters-open]')!;
const setPanel = (open: boolean) => {
  panel.classList.toggle('open', open);
  opener.setAttribute('aria-expanded', String(open));
  document.documentElement.style.overflow = open ? 'hidden' : '';
};
opener.addEventListener('click', () => setPanel(true));
$$('[data-filters-close]').forEach((b) => b.addEventListener('click', () => setPanel(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open')) setPanel(false); });

// save search
const save = $<HTMLFormElement>('[data-save]');
save?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const mail = save.querySelector<HTMLInputElement>('[name="email"]')!;
  if (!mail.value.trim() || !mail.checkValidity()) { mail.setAttribute('aria-invalid', 'true'); mail.focus(); return; }
  mail.setAttribute('aria-invalid', 'false');
  const res = await sendRequest('Avviso nuove macchine', { Email: mail.value.trim(), Ricerca: location.href, Lingua: cfg.lang });
  if (res === 'error') { mail.setCustomValidity(L.sendError); mail.reportValidity(); mail.setCustomValidity(''); return; }
  save.hidden = true;
  ($('[data-saved]')!).hidden = false;
});

sync();
update(false);
