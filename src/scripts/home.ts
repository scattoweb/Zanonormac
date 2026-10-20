import { $, $$, bindSeg, branchCfg, bump, fill, flash, getBranch, onBranch, persistFields, reanimate, sendRequest, setBranch, start } from './ui';

start();

interface HomeData {
  i18n: {
    showN: string; show1: string; rentN: string; none: string;
    day: string; days: string; sumSite: string; sumPick: string; badDates: string;
    book: string; partsDone: string; partsHint: string;
    thanks: string; sentPlain: string; sentPhone: string; sentNoPhone: string; sentWa: string; sendError: string; sending: string; send: string;
    rentTypes: Record<string, string>;
    branches: Record<string, string>;
    topics: Record<string, { owner: string; ph: string; label: string }>;
  };
  items: { g: string; b: string; c: string }[];
  fleet: { cat: string; b: string }[];
  rentAction: string;
  stockAction: string;
}
const data: HomeData = JSON.parse($('#home-data')?.textContent || '{}');
const L = data.i18n;

/* ---------- hero search ---------- */
const GROUP_TO_RENT: Record<string, string> = { esc: 'esc', mini: 'esc', pale: 'pale', dump: 'trans', mov: 'lift', fran: '' };
const heroForm = $<HTMLFormElement>('[data-hero-search]');
if (heroForm) {
  const condInput = heroForm.querySelector<HTMLInputElement>('input[name="cond"]')!;
  const cat = heroForm.querySelector<HTMLSelectElement>('#q-cat')!;
  const brand = heroForm.querySelector<HTMLSelectElement>('#q-brand')!;
  const out = $('[data-hero-count]', heroForm)!;
  let tab = 'usato';
  const count = () => {
    if (tab === 'noleggio') {
      const rc = cat.value ? GROUP_TO_RENT[cat.value] : '';
      return data.fleet.filter((f) => (!cat.value || (rc && f.cat === rc)) && (!brand.value || f.b === brand.value)).length;
    }
    return data.items.filter((m) => m.c === tab && (!cat.value || m.g === cat.value) && (!brand.value || m.b === brand.value)).length;
  };
  const paint = () => {
    const n = count();
    out.textContent = n === 0 ? L.none : tab === 'noleggio' ? fill(L.rentN, { n }) : n === 1 ? L.show1 : fill(L.showN, { n });
    bump(out);
  };
  bindSeg($('[data-hero-tabs]', heroForm), (v) => { tab = v; paint(); }, 'aria-selected');
  cat.addEventListener('change', paint);
  brand.addEventListener('change', paint);
  heroForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (count() === 0) { location.hash = '#contatti'; return; }
    const q = new URLSearchParams();
    if (tab === 'noleggio') {
      const rc = cat.value ? GROUP_TO_RENT[cat.value] : '';
      if (rc) q.set('cat', rc);
      location.href = data.rentAction + (q.toString() ? '?' + q : '') + '#flotta';
      return;
    }
    q.set('cond', tab);
    if (cat.value) q.set('cat', cat.value);
    if (brand.value) q.set('brand', brand.value);
    condInput.value = tab;
    location.href = data.stockAction + '?' + q;
  });
  paint();
}

/* ---------- stock grid ---------- */
const grid = $('[data-stock-grid]');
if (grid) {
  const cards = $$('[data-machine]', grid);
  const chips = $$<HTMLButtonElement>('[data-stock-chips] .chip');
  const empty = $('[data-stock-empty]');
  let cond = 'tutte';
  let group = 'all';
  const paint = () => {
    let shown = 0;
    cards.forEach((c) => {
      const ok = (cond === 'tutte' || c.dataset.cond === cond) && (group === 'all' || c.dataset.group === group);
      const visible = ok && shown < 8;
      c.hidden = !visible;
      if (visible) c.style.setProperty('--i', String(shown++));
    });
    chips.forEach((ch) => {
      const g = ch.dataset.value!;
      const n = cards.filter((c) => (cond === 'tutte' || c.dataset.cond === cond) && (g === 'all' || c.dataset.group === g)).length;
      const badge = $('.chip__n', ch);
      if (badge && badge.textContent !== String(n)) { badge.textContent = String(n); bump(badge); }
    });
    if (empty) empty.hidden = shown > 0;
    reanimate(grid);
  };
  bindSeg($('[data-stock-cond]'), (v) => { cond = v; paint(); });
  chips.forEach((ch) => ch.addEventListener('click', () => {
    group = ch.dataset.value!;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === ch)));
    paint();
  }));
  paint();
}

/* ---------- brands ---------- */
const brandRows = $$<HTMLButtonElement>('[data-brands] .brandrow');
const pickBrand = (id: string) => {
  brandRows.forEach((r) => r.setAttribute('aria-selected', String(r.dataset.brand === id)));
  $$('[data-brand-img]').forEach((img) => img.classList.toggle('on', img.dataset.brandImg === id));
  $$('[data-brand-info]').forEach((el) => {
    const on = el.dataset.brandInfo === id;
    if (on && el.hidden) { el.hidden = false; el.classList.remove('fade-up'); void el.offsetWidth; el.classList.add('fade-up'); } else if (!on) el.hidden = true;
  });
};
brandRows.forEach((r) => {
  r.addEventListener('click', () => pickBrand(r.dataset.brand!));
  r.addEventListener('pointerenter', (e) => { if ((e as PointerEvent).pointerType === 'mouse') pickBrand(r.dataset.brand!); });
  r.addEventListener('keydown', (e) => {
    const i = brandRows.indexOf(r);
    const next = e.key === 'ArrowDown' ? brandRows[i + 1] : e.key === 'ArrowUp' ? brandRows[i - 1] : null;
    if (next) { e.preventDefault(); next.focus(); pickBrand(next.dataset.brand!); }
  });
});

/* ---------- quick rental form ---------- */
const rent = $<HTMLFormElement>('[data-rent-quick]');
if (rent) {
  persistFields(rent, 'zo-home-rent');
  const from = rent.querySelector<HTMLInputElement>('[name="from"]')!;
  const to = rent.querySelector<HTMLInputElement>('[name="to"]')!;
  const type = rent.querySelector<HTMLSelectElement>('[name="type"]')!;
  const site = rent.querySelector<HTMLInputElement>('[name="site"]')!;
  const branchRow = $('[data-rent-branch]', rent)!;
  const summary = $('[data-rent-summary]', rent)!;
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const today = new Date();
  if (!from.value) { const d = new Date(today); d.setDate(d.getDate() + 1); from.value = iso(d); }
  if (!to.value) { const d = new Date(from.value); d.setDate(d.getDate() + 4); to.value = iso(d); }
  from.min = iso(today);
  const paint = () => {
    const days = Math.round((new Date(to.value).getTime() - new Date(from.value).getTime()) / 86400000) + 1;
    const ok = !isNaN(days) && days >= 1;
    const pickup = site.value === '0';
    branchRow.hidden = !pickup;
    summary.textContent = ok
      ? `${L.rentTypes[type.value]} · ${days} ${days === 1 ? L.day : L.days} · ${pickup ? L.sumPick + ' ' + L.branches[getBranch()] : L.sumSite}`
      : L.badDates;
    flash($('[data-rent-summary-box]', rent));
    to.min = from.value;
  };
  const deliv = bindSeg($('[data-rent-deliv]', rent), (v) => { site.value = v; site.dispatchEvent(new Event('change')); paint(); });
  deliv.set(site.value || '1');
  [from, to, type].forEach((el) => el.addEventListener('change', paint));
  onBranch(paint);
  paint();
}

/* ---------- service: workshop picker ---------- */
const shops = $$<HTMLButtonElement>('[data-shops] .shop');
const book = $<HTMLAnchorElement>('[data-book]');
const paintShop = (id: string) => {
  shops.forEach((s) => s.setAttribute('aria-checked', String(s.dataset.branch === id)));
  if (book) { book.textContent = fill(L.book, { x: L.branches[id] }); bump(book); }
};
shops.forEach((s) => {
  s.addEventListener('click', () => setBranch(s.dataset.branch!));
  s.addEventListener('keydown', (e) => {
    const i = shops.indexOf(s);
    const next = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? shops[(i + 1) % shops.length] : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? shops[(i - 1 + shops.length) % shops.length] : null;
    if (next) { e.preventDefault(); next.focus(); setBranch(next.dataset.branch!); }
  });
});
onBranch(paintShop);
paintShop(getBranch());

/* ---------- parts ---------- */
const parts = $<HTMLFormElement>('[data-parts]');
parts?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = (parts.querySelector<HTMLInputElement>('[name="part"]')!.value || '').trim();
  if (!code) return;
  const res = await sendRequest('Ricambi', { Codice: code, Sede: branchCfg(getBranch()).short });
  const hint = $('[data-parts-hint]', parts)!;
  hint.textContent = res === 'error' ? L.sendError : fill(L.partsDone, { x: code });
});

/* ---------- contact ---------- */
const contact = $<HTMLFormElement>('[data-contact]');
if (contact) {
  persistFields(contact, 'zo-home-contact');
  const topicInput = contact.querySelector<HTMLInputElement>('[name="topic"]')!;
  const topicChips = $$<HTMLButtonElement>('[data-topics] .chip', contact);
  const msg = contact.querySelector<HTMLTextAreaElement>('[name="message"]')!;
  const owner = $('[data-owner]', contact)!;
  const pickTopic = (id: string) => {
    if (!L.topics[id]) return;
    topicInput.value = id;
    topicChips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.value === id)));
    msg.placeholder = L.topics[id].ph;
    owner.textContent = L.topics[id].owner;
    bump(owner);
  };
  topicChips.forEach((c) => c.addEventListener('click', () => pickTopic(c.dataset.value!)));
  const fromUrl = new URLSearchParams(location.search).get('topic');
  if (fromUrl) pickTopic(fromUrl);

  const done = $('[data-done]')!;
  const err = $('[data-error]', contact)!;
  contact.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = contact.querySelector<HTMLInputElement>('[name="name"]')!;
    const phone = contact.querySelector<HTMLInputElement>('[name="phone"]')!;
    let bad = false;
    [name, phone].forEach((f) => { const empty = !f.value.trim(); f.setAttribute('aria-invalid', String(empty)); if (empty && !bad) { f.focus(); bad = true; } });
    if (bad) return;
    const btn = contact.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    btn.disabled = true; btn.textContent = L.sending;
    const res = await sendRequest(`Richiesta dal sito: ${L.topics[topicInput.value]?.label || ''}`, {
      Nome: name.value.trim(), Telefono: phone.value.trim(), Messaggio: msg.value.trim(), Sede: branchCfg(getBranch()).short,
    });
    btn.disabled = false; btn.textContent = L.send;
    if (res === 'error') { err.textContent = L.sendError; err.hidden = false; return; }
    err.hidden = true;
    const first = name.value.trim().split(' ')[0];
    $('[data-done-title]')!.textContent = first ? fill(L.thanks, { x: first }) : L.sentPlain;
    $('[data-done-text]')!.textContent = res === 'whatsapp' ? L.sentWa : phone.value ? fill(L.sentPhone, { x: phone.value.trim() }) : L.sentNoPhone;
    contact.hidden = true; done.hidden = false;
  });
  $('[data-done-reset]')?.addEventListener('click', () => { msg.value = ''; msg.dispatchEvent(new Event('input')); done.hidden = true; contact.hidden = false; });
}
