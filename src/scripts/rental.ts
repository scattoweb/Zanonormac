import { $, $$, bindSeg, branchCfg, bump, eur, fill, getBranch, onBranch, persistFields, reanimate, sendRequest, start } from './ui';

start();

const D = JSON.parse($('#rent-data')?.textContent || '{}') as {
  fleet: { id: string; type: string; day: number; name: string; cls: string }[];
  week: number; month: number;
  i18n: {
    day: string; days: string; uDay: string; uWeek: string; uMonth: string; choose: string; chosen: string;
    rentLine: string; extras: string; transport: string; toQuote: string; pickup: string; free: string; toSite: string;
    sending: string; send: string; sendError: string; sentWa: string; bookSentP: string; perDay: string; estimate: string; vat: string;
    branches: Record<string, string>;
  };
};
const L = D.i18n;
const weekRate = (d: number) => Math.round(d * D.week);
const monthRate = (d: number) => Math.round(d * D.month);
/** Effective daily price: weekly and monthly tariffs apply from 5 and 20 days. */
const perDay = (d: number, days: number) => (days >= 20 ? monthRate(d) / 20 : days >= 5 ? weekRate(d) / 5 : d);

const params = new URLSearchParams(location.search);
const fromType = params.get('type');
const state = {
  cat: params.get('cat') || 'all',
  period: ['week', 'month'].includes(params.get('period') || '') ? params.get('period')! : 'day',
  sel: (D.fleet.find((f) => f.id === params.get('m')) || D.fleet.find((f) => f.type === fromType) || D.fleet[0]).id,
  site: params.get('site') !== '0',
  extras: params.has('x') ? (params.get('x') || '').split(',').filter(Boolean) : ['cover'],
};

const form = $<HTMLFormElement>('[data-book]')!;
const from = $<HTMLInputElement>('#b-from', form)!;
const to = $<HTMLInputElement>('#b-to', form)!;
const cards = $$('[data-rent]');
const grid = $('[data-fleet]')!;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const today = new Date();
from.min = iso(today);
from.value = params.get('from') || (() => { const d = new Date(today); d.setDate(d.getDate() + 1); return iso(d); })();
to.value = params.get('to') || (() => { const d = new Date(from.value); d.setDate(d.getDate() + 11); return iso(d); })();
persistFields(form, 'zo-rent');

function writeUrl() {
  const p = new URLSearchParams();
  if (state.cat !== 'all') p.set('cat', state.cat);
  if (state.period !== 'day') p.set('period', state.period);
  p.set('m', state.sel);
  p.set('from', from.value);
  p.set('to', to.value);
  if (!state.site) p.set('site', '0');
  p.set('x', state.extras.join(','));
  history.replaceState(null, '', `${location.pathname}?${p}${location.hash}`);
}

function paintFleet(animate: boolean) {
  const unit = state.period === 'week' ? L.uWeek : state.period === 'month' ? L.uMonth : L.uDay;
  let i = 0;
  cards.forEach((c) => {
    const visible = state.cat === 'all' || c.dataset.cat === state.cat;
    c.hidden = !visible;
    if (visible) c.style.setProperty('--i', String(i++));
    const day = Number(c.dataset.day);
    const rate = $('[data-rate]', c)!;
    const value = eur(state.period === 'week' ? weekRate(day) : state.period === 'month' ? monthRate(day) : day);
    if (rate.textContent !== value) { rate.textContent = value; bump(rate); }
    $('[data-unit]', c)!.textContent = unit;
    const on = c.dataset.rent === state.sel;
    c.setAttribute('aria-current', String(on));
    $('[data-pick]', c)!.textContent = on ? L.chosen : L.choose;
  });
  if (animate) reanimate(grid);
}

function paintBooking() {
  const m = D.fleet.find((f) => f.id === state.sel)!;
  $$<HTMLImageElement>('[data-sel-img]').forEach((img) => { img.hidden = img.dataset.selImg !== m.id; img.loading = 'eager'; });
  const name = $('[data-sel-name]')!;
  if (name.textContent !== m.name) { name.textContent = m.name; bump($('[data-sel]')); }
  $('[data-sel-cls]')!.textContent = m.cls;
  $('[data-addr-row]')!.hidden = !state.site;
  $('[data-branch-row]')!.hidden = state.site;
  to.min = from.value;

  const days = Math.round((new Date(to.value).getTime() - new Date(from.value).getTime()) / 86400000) + 1;
  const ok = !isNaN(days) && days >= 1;
  $('[data-bad]')!.hidden = ok;
  ($<HTMLButtonElement>('[data-submit]')!).disabled = !ok;
  const lines = $('[data-lines]')!;
  lines.hidden = !ok;
  if (!ok) return;
  const pd = perDay(m.day, days);
  const extraDay = $$<HTMLInputElement>('input[name="extra"]', form).filter((x) => x.checked).reduce((s, x) => s + Number(x.dataset.day), 0);
  const dayWord = days === 1 ? L.day : L.days;
  const row = (k: string, v: string, cls = '') => {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    const a = document.createElement('span'); a.textContent = k;
    const b = document.createElement(cls ? 'b' : 'span'); b.textContent = v; if (!cls) b.className = 'mono';
    d.append(a, b);
    return d;
  };
  const total = row(L.estimate, eur(pd * days + extraDay * days), 'total');
  (total.firstElementChild as HTMLElement).style.fontWeight = '600';
  const vat = document.createElement('small'); vat.textContent = ' ' + L.vat; vat.style.cssText = 'font-size:12px;color:var(--on-ink-muted)';
  const valWrap = document.createElement('span');
  valWrap.append(total.lastElementChild!, vat);
  total.append(valWrap);
  lines.replaceChildren(
    row(fill(L.rentLine, { x: `${days} ${dayWord} × ${eur(pd)}` }), eur(pd * days)),
    row(L.extras, eur(extraDay * days)),
    row(state.site ? L.transport : L.pickup, state.site ? L.toQuote : L.free),
    total,
  );
  bump($('b', total));
}

function update(animate = false) { paintFleet(animate); paintBooking(); writeUrl(); }

// category chips
const catChips = $$<HTMLButtonElement>('[data-rcats] .chip');
const setCat = (v: string) => { state.cat = v; catChips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.value === v))); };
catChips.forEach((c) => c.addEventListener('click', () => { setCat(c.dataset.value!); update(true); }));
setCat(state.cat);

bindSeg($('[data-period]'), (v) => { state.period = v; update(); }).set(state.period);
bindSeg($('[data-site]'), (v) => { state.site = v === '1'; update(); }).set(state.site ? '1' : '0');
$$<HTMLAnchorElement>('[data-pick]').forEach((a) => a.addEventListener('click', () => { state.sel = a.dataset.pick!; update(); }));
[from, to].forEach((el) => el.addEventListener('change', () => update()));
$$<HTMLInputElement>('input[name="extra"]', form).forEach((x) => {
  x.checked = state.extras.includes(x.value);
  x.addEventListener('change', () => { state.extras = $$<HTMLInputElement>('input[name="extra"]', form).filter((y) => y.checked).map((y) => y.value); update(); });
});
onBranch(() => update());

// FAQ accordion
$$<HTMLButtonElement>('[data-faq]').forEach((q) => q.addEventListener('click', () => {
  const open = q.getAttribute('aria-expanded') === 'true';
  $$('[data-faq]').forEach((o) => o.setAttribute('aria-expanded', 'false'));
  q.setAttribute('aria-expanded', String(!open));
}));

// submit
const done = $('[data-book-done]')!;
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $<HTMLInputElement>('#b-name', form)!;
  const phone = $<HTMLInputElement>('#b-phone', form)!;
  let bad = false;
  [name, phone].forEach((f) => { const empty = !f.value.trim(); f.setAttribute('aria-invalid', String(empty)); if (empty && !bad) { f.focus(); bad = true; } });
  if (bad) return;
  const m = D.fleet.find((f) => f.id === state.sel)!;
  const btn = $<HTMLButtonElement>('[data-submit]')!;
  btn.disabled = true; btn.textContent = L.sending;
  const where = state.site ? `${L.toSite}: ${($<HTMLInputElement>('#addr', form)!).value.trim() || '—'}` : `${L.pickup}: ${branchCfg(getBranch()).short}`;
  const res = await sendRequest(`Richiesta noleggio: ${m.name}`, {
    Macchina: m.name, Dal: from.value, Al: to.value, Consegna: where,
    Accessori: state.extras.join(', '), Stima: $('[data-lines] .total b')?.textContent || '',
    Nome: name.value.trim(), Telefono: phone.value.trim(),
  });
  btn.disabled = false; btn.textContent = L.send;
  if (res === 'error') { $('[data-bad]')!.textContent = L.sendError; $('[data-bad]')!.hidden = false; return; }
  $('[data-book-done-text]')!.textContent = `${m.name} · ${from.value} → ${to.value}. ${res === 'whatsapp' ? L.sentWa : L.bookSentP}`;
  form.hidden = true; done.hidden = false;
});
$('[data-book-edit]')?.addEventListener('click', () => { done.hidden = true; form.hidden = false; });

update();
