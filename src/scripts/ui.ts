/* Shared browser helpers. Imported by site.ts and by each page script. */

export type Lang = 'it' | 'de' | 'en';
interface BranchCfg { id: string; de: boolean; phone: string; short: string }
interface Config {
  lang: Lang;
  alternates: Record<Lang, string>;
  branches: BranchCfg[];
  toast: { de: string; it: string };
  undo: string;
  whatsapp: string;
  formEndpoint: string;
}

export const cfg: Config = JSON.parse(document.getElementById('zo-config')?.textContent || '{}');

/* ---------- storage that never throws (private mode, blocked storage) ---------- */
const safe = (s: () => Storage) => ({
  get(k: string) { try { return s().getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { s().setItem(k, v); } catch { /* ignore */ } },
  del(k: string) { try { s().removeItem(k); } catch { /* ignore */ } },
});
export const local = safe(() => localStorage);
export const session = safe(() => sessionStorage);

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
export const fill = (s: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((acc, [k, v]) => acc.split(`{${k}}`).join(String(v)), s);
export const num = (n: number) => Number(n).toLocaleString('it-IT');
export const eur = (n: number) => '€ ' + num(Math.round(n));

/* ---------- small animations ---------- */
export function bump(el: Element | null) {
  if (!el) return;
  const next = el.classList.contains('bump-a') ? 'bump-b' : 'bump-a';
  el.classList.remove('bump-a', 'bump-b');
  el.classList.add(next);
}
export function reanimate(el: Element | null) {
  if (!el) return;
  const next = el.classList.contains('anim-a') ? 'anim-b' : 'anim-a';
  el.classList.remove('anim-a', 'anim-b');
  el.classList.add(next);
}
export function flash(el: Element | null) {
  if (!el) return;
  el.classList.remove('flash');
  void (el as HTMLElement).offsetWidth;
  el.classList.add('flash');
}

/** Segmented control: buttons inside `.seg`, thumb follows the pressed one. */
export function bindSeg(seg: HTMLElement | null, onPick: (value: string, index: number) => void, attr: 'aria-pressed' | 'aria-selected' = 'aria-pressed') {
  if (!seg) return { set: (_: string) => {} };
  const buttons = $$<HTMLButtonElement>('button', seg);
  seg.style.setProperty('--n', String(buttons.length));
  const set = (value: string) => {
    buttons.forEach((b, i) => {
      const on = b.dataset.value === value;
      b.setAttribute(attr, String(on));
      if (on) seg.style.setProperty('--i', String(i));
    });
  };
  buttons.forEach((b, i) => b.addEventListener('click', () => { set(b.dataset.value!); onPick(b.dataset.value!, i); }));
  return { set };
}

/* ---------- branch + language ---------- */
const DEFAULT_BRANCH = 'rodengo';
export const branchCfg = (id: string) => cfg.branches.find((b) => b.id === id) ?? cfg.branches[0];
export const getBranch = () => {
  const id = local.get('zo-branch');
  return id && cfg.branches.some((b) => b.id === id) ? id : DEFAULT_BRANCH;
};

function paintBranch(id: string) {
  const b = branchCfg(id);
  $$<HTMLSelectElement>('[data-branch-select]').forEach((s) => { s.value = id; });
  $$<HTMLAnchorElement>('[data-branch-phone]').forEach((a) => { a.href = 'tel:+39' + b.phone.replace(/\s/g, ''); });
  $$('[data-branch-phone-text]').forEach((el) => { el.textContent = b.phone; bump(el); });
}

function goToLang(target: Lang, toast?: { lang: Lang; prev: Lang; branch: string }) {
  if (toast) session.set('zo-toast', JSON.stringify(toast));
  document.dispatchEvent(new CustomEvent('zo:leave'));
  location.href = cfg.alternates[target] + location.search + location.hash;
}

/**
 * Choosing a branch in Trentino-Alto Adige switches the site to German; choosing a Lombardy
 * branch afterwards goes back to Italian, but only if German was switched on automatically.
 */
export function setBranch(id: string) {
  local.set('zo-branch', id);
  paintBranch(id);
  document.dispatchEvent(new CustomEvent('zo:branch', { detail: id }));
  const b = branchCfg(id);
  if (b.de && cfg.lang !== 'de') {
    local.set('zo-auto-de', '1');
    goToLang('de', { lang: 'de', prev: cfg.lang, branch: id });
  } else if (!b.de && cfg.lang === 'de' && local.get('zo-auto-de') === '1') {
    local.set('zo-auto-de', '0');
    goToLang('it', { lang: 'it', prev: 'de', branch: id });
  }
}

export const onBranch = (cb: (id: string) => void) => document.addEventListener('zo:branch', (e) => cb((e as CustomEvent<string>).detail));

function showLangToast() {
  const raw = session.get('zo-toast');
  if (!raw) return;
  session.del('zo-toast');
  let info: { lang: Lang; prev: Lang; branch: string };
  try { info = JSON.parse(raw); } catch { return; }
  if (info.lang !== cfg.lang) return;
  const msg = fill(info.lang === 'de' ? cfg.toast.de : cfg.toast.it, { x: branchCfg(info.branch).short });
  toast(info.lang.toUpperCase(), msg, cfg.undo, () => {
    local.set('zo-auto-de', '0');
    goToLang(info.prev);
  });
}

let toastTimer = 0;
export function toast(badge: string, text: string, actionLabel?: string, action?: () => void) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  const b = document.createElement('span'); b.className = 'toast__lang'; b.textContent = badge;
  const t = document.createElement('span'); t.className = 'toast__txt'; t.textContent = text;
  el.append(b, t);
  if (actionLabel && action) {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'toast__undo ripple'; btn.textContent = actionLabel;
    btn.addEventListener('click', () => { el.remove(); action(); });
    el.append(btn);
  }
  document.body.append(el);
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.remove(), 6000);
}

/* ---------- favourites ---------- */
const favs = new Set<string>(JSON.parse(local.get('zo-favs') || '[]'));
function paintHeart(btn: HTMLElement) {
  const on = favs.has(btn.dataset.fav!);
  btn.setAttribute('aria-pressed', String(on));
  btn.setAttribute('aria-label', (on ? btn.dataset.labelOff : btn.dataset.labelOn) || '');
}

/* ---------- forms ---------- */
export type SendResult = 'sent' | 'whatsapp' | 'error';
/**
 * Sends a request. With PUBLIC_FORM_ENDPOINT set it POSTs JSON there; without one it opens
 * WhatsApp with the same text, so the site works before a form service is chosen.
 */
export async function sendRequest(subject: string, fields: Record<string, string>): Promise<SendResult> {
  const lines = [subject, ...Object.entries(fields).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)];
  if (cfg.formEndpoint) {
    try {
      const res = await fetch(cfg.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ subject, lang: cfg.lang, page: location.href, branch: getBranch(), ...fields }),
      });
      return res.ok ? 'sent' : 'error';
    } catch { return 'error'; }
  }
  window.open(`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  return 'whatsapp';
}

/** Keep form values across reloads and language switches (per tab). */
export function persistFields(root: ParentNode, key: string) {
  const fields = $$<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-persist]', root);
  let saved: Record<string, string | boolean> = {};
  try { saved = JSON.parse(session.get(key) || '{}'); } catch { saved = {}; }
  fields.forEach((f) => {
    const v = saved[f.name];
    if (v === undefined) return;
    if (f instanceof HTMLInputElement && f.type === 'checkbox') f.checked = !!v;
    else f.value = String(v);
  });
  const save = () => {
    const out: Record<string, string | boolean> = {};
    fields.forEach((f) => { out[f.name] = f instanceof HTMLInputElement && f.type === 'checkbox' ? f.checked : f.value; });
    session.set(key, JSON.stringify(out));
  };
  fields.forEach((f) => { f.addEventListener('input', save); f.addEventListener('change', save); });
  return save;
}

/* ---------- one-time page setup ---------- */
let started = false;
export function start() {
  if (started) return;
  started = true;

  local.set('zo-lang', cfg.lang);
  paintBranch(getBranch());
  $$<HTMLSelectElement>('[data-branch-select]').forEach((s) => s.addEventListener('change', () => setBranch(s.value)));
  $$<HTMLAnchorElement>('[data-lang-link]').forEach((a) => a.addEventListener('click', () => local.set('zo-auto-de', '0')));
  showLangToast();

  // ripple origin follows the pointer
  document.addEventListener('pointerdown', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('.ripple, .chip');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--rpx', `${e.clientX - r.left}px`);
    el.style.setProperty('--rpy', `${e.clientY - r.top}px`);
  });

  // cards tilt towards the cursor and catch a soft highlight (mouse only)
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fine) {
    let current: HTMLElement | null = null;
    document.addEventListener('pointermove', (e) => {
      const card = (e.target as Element).closest<HTMLElement>('.card');
      if (current && current !== card) { current.style.setProperty('--rx', '0deg'); current.style.setProperty('--ry', '0deg'); }
      current = card;
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      card.style.setProperty('--rx', `${((0.5 - y) * 5).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${((x - 0.5) * 6).toFixed(2)}deg`);
    });
    $$('[data-parallax]').forEach((hero) => {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--px', `${(((e.clientX - r.left) / r.width - 0.5) * -18).toFixed(1)}px`);
        hero.style.setProperty('--py', `${(((e.clientY - r.top) / r.height - 0.5) * -12).toFixed(1)}px`);
      });
      hero.addEventListener('pointerleave', () => { hero.style.setProperty('--px', '0px'); hero.style.setProperty('--py', '0px'); });
    });
  }

  // favourites
  $$('[data-fav]').forEach(paintHeart);
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLElement>('[data-fav]');
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.fav!;
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    local.set('zo-favs', JSON.stringify([...favs]));
    $$(`[data-fav="${id}"]`).forEach(paintHeart);
  });

  // WhatsApp button appears once the visitor scrolls past the first screen
  const fab = $('.fab');
  if (fab) {
    const onScroll = () => fab.classList.toggle('show', scrollY > Math.min(520, innerHeight * 0.6));
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // mobile menu
  const menu = $('[data-menu]');
  const opener = $<HTMLButtonElement>('[data-menu-open]');
  const setMenu = (open: boolean) => {
    menu?.classList.toggle('open', open);
    opener?.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) $<HTMLElement>('.mmenu__close', menu!)?.focus();
  };
  opener?.addEventListener('click', () => setMenu(true));
  $$('[data-menu-close]').forEach((el) => el.addEventListener('click', () => setMenu(false)));
  $$('a', menu || document.createElement('div')).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu?.classList.contains('open')) setMenu(false); });
}
