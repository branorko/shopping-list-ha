/* ============================================================
   shopping-list-card.js  —  Home Assistant Lovelace Card
   Shopping List with categories, predefined products, print
   v1.0.1 — proper full-screen modals via document.body
   ============================================================ */

const API_URL = '/api/shopping_list/data';

/* ── i18n ──────────────────────────────────────────────────── */
const TRANSLATIONS = {
  sk: {
    title: 'Nákupný zoznam', add: 'Pridať položku', settings: 'Nastavenia',
    bought: 'Kúpené', delete: 'Zmazať', save: 'Uložiť', cancel: 'Zrušiť',
    back: 'Späť', close: 'Zatvoriť', qty: 'Počet ks', itemName: 'Názov položky',
    markBought: 'Označiť za kúpené', markPending: 'Označiť ako nekúpené',
    confirmDelete: 'Naozaj zmazať?', categories: 'Kategórie',
    products: 'Preddefinovaný tovar', catName: 'Názov kategórie',
    addCat: 'Pridať kategóriu', prodName: 'Názov tovaru', prodCat: 'Kategória',
    addProd: 'Pridať tovar', selectCat: 'Vyberte kategóriu',
    addFromCatalog: 'Pridať z katalógu', customItem: 'Vlastná položka',
    qtyLabel: 'Počet kusov', confirm: 'Potvrdiť', addMore: 'Pridať ďalší',
    backToCats: 'Späť na kategórie', exitAdd: 'Ukončiť pridávanie',
    noItems: 'Zoznam je prázdny. Kliknite + a pridajte položku.',
    noCats: 'Zatiaľ žiadne kategórie.', noProds: 'Zatiaľ žiadne produkty.',
    duplicate: 'Položka s týmto názvom už v zozname existuje.',
    printList: 'Tlačiť zoznam', allItems: 'Všetky položky',
    pending: 'Na kúpenie', boughtItems: 'Kúpené', clearBought: 'Odstrániť kúpené',
    loading: 'Načítavam…',
  },
  en: {
    title: 'Shopping List', add: 'Add item', settings: 'Settings',
    bought: 'Bought', delete: 'Delete', save: 'Save', cancel: 'Cancel',
    back: 'Back', close: 'Close', qty: 'Qty', itemName: 'Item name',
    markBought: 'Mark as bought', markPending: 'Mark as not bought',
    confirmDelete: 'Really delete?', categories: 'Categories',
    products: 'Predefined products', catName: 'Category name',
    addCat: 'Add category', prodName: 'Product name', prodCat: 'Category',
    addProd: 'Add product', selectCat: 'Select category',
    addFromCatalog: 'Add from catalog', customItem: 'Custom item',
    qtyLabel: 'Quantity', confirm: 'Confirm', addMore: 'Add more',
    backToCats: 'Back to categories', exitAdd: 'Exit adding',
    noItems: 'List is empty. Click + to add an item.',
    noCats: 'No categories yet.', noProds: 'No products yet.',
    duplicate: 'An item with this name already exists.',
    printList: 'Print list', allItems: 'All items',
    pending: 'To buy', boughtItems: 'Bought', clearBought: 'Remove bought',
    loading: 'Loading…',
  },
  cs: {
    title: 'Nákupní seznam', add: 'Přidat položku', settings: 'Nastavení',
    bought: 'Koupeno', delete: 'Smazat', save: 'Uložit', cancel: 'Zrušit',
    back: 'Zpět', close: 'Zavřít', qty: 'Počet ks', itemName: 'Název položky',
    markBought: 'Označit jako koupené', markPending: 'Označit jako nekoupené',
    confirmDelete: 'Opravdu smazat?', categories: 'Kategorie',
    products: 'Předdefinované zboží', catName: 'Název kategorie',
    addCat: 'Přidat kategorii', prodName: 'Název zboží', prodCat: 'Kategorie',
    addProd: 'Přidat zboží', selectCat: 'Vyberte kategorii',
    addFromCatalog: 'Přidat z katalogu', customItem: 'Vlastní položka',
    qtyLabel: 'Počet kusů', confirm: 'Potvrdit', addMore: 'Přidat další',
    backToCats: 'Zpět na kategorie', exitAdd: 'Ukončit přidávání',
    noItems: 'Seznam je prázdný. Klikněte + a přidejte položku.',
    noCats: 'Zatím žádné kategorie.', noProds: 'Zatím žádné produkty.',
    duplicate: 'Položka s tímto názvem již existuje.',
    printList: 'Tisknout seznam', allItems: 'Všechny položky',
    pending: 'K nákupu', boughtItems: 'Koupeno', clearBought: 'Odebrat koupené',
    loading: 'Načítám…',
  },
};

function getLang(hass) {
  const lang = hass?.locale?.language || navigator.language || 'en';
  return TRANSLATIONS[lang.slice(0, 2).toLowerCase()] || TRANSLATIONS['en'];
}

/* ── DOM helpers ────────────────────────────────────────────── */
function el(tag, cls = '') { const e = document.createElement(tag); if (cls) e.className = cls; return e; }
function elTxt(tag, text, cls = '') { const e = el(tag, cls); e.textContent = text; return e; }
function btn(label, cls = 'sl-btn') { const b = el('button', cls); b.textContent = label; return b; }
function inp(type, ph = '') { const i = document.createElement('input'); i.type = type; i.placeholder = ph; return i; }
function iconBtn(icon, title, cls = 'sl-icon-btn') {
  const b = el('button', cls); b.title = title; b.innerHTML = icon; return b;
}

/* ── Icons ──────────────────────────────────────────────────── */
const ICONS = {
  settings: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  print: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  back: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
  close: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

/* ── Modal styles — injected into document.head once ──────── */
const MODAL_STYLES = `
.sl-modal-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.82);
  display: flex; flex-direction: column;
  animation: slFadeIn .18s ease;
  font-family: var(--primary-font-family, Roboto, sans-serif);
}
@keyframes slFadeIn { from { opacity:0; } to { opacity:1; } }

.sl-modal {
  background: #1c1c1e;
  display: flex; flex-direction: column;
  flex: 1; overflow: hidden;
  max-width: 640px; width: 100%;
  margin: 0 auto;
  animation: slSlideUp .2s ease;
}
@keyframes slSlideUp { from { transform:translateY(24px);opacity:0; } to { transform:none;opacity:1; } }

.sl-modal-header {
  display: flex; align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  gap: 8px; flex-shrink: 0;
}
.sl-modal-title {
  flex: 1; font-size: 16px; font-weight: 600; color: #fff;
}
.sl-modal-body {
  flex: 1; overflow-y: auto; padding: 16px;
}

/* Bottom sheet */
.sl-sheet-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.65);
  display: flex; align-items: flex-end;
  animation: slFadeIn .15s ease;
  font-family: var(--primary-font-family, Roboto, sans-serif);
}
.sl-sheet {
  background: #242428;
  border-radius: 20px 20px 0 0;
  padding: 20px; width: 100%;
  display: flex; flex-direction: column; gap: 14px;
  box-shadow: 0 -12px 40px rgba(0,0,0,0.6);
  animation: slSheetUp .2s ease;
  max-height: 90vh; overflow-y: auto;
  max-width: 640px; margin: 0 auto;
}
@keyframes slSheetUp { from { transform:translateY(100%); } to { transform:translateY(0); } }

/* shared */
.sl-icon-btn {
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.5); padding: 7px; border-radius: 8px;
  display: flex; align-items: center;
  transition: background .15s, color .15s;
}
.sl-icon-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
.sl-icon-btn svg { display: block; }

.sl-btn {
  border: none; border-radius: 10px; padding: 11px 18px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: opacity .12s, transform .1s; flex: 1;
  font-family: inherit;
}
.sl-btn:active { transform: scale(0.97); }
.sl-btn-primary { background: var(--primary-color, #03a9f4); color: #fff; }
.sl-btn-secondary { background: rgba(255,255,255,0.1); color: #fff; }
.sl-btn-danger { background: rgba(239,68,68,0.15); color: #ef4444; }
.sl-btn-ghost { background: none; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); }

.sl-stepper { display: flex; align-items: center; gap: 12px; }
.sl-step-btn {
  width: 40px; height: 40px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.07); color: #fff;
  font-size: 22px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .12s; flex-shrink: 0;
}
.sl-step-btn:hover { background: rgba(255,255,255,0.14); }
.sl-qty-val { font-size: 28px; font-weight: 700; color: #fff; min-width: 48px; text-align: center; }

.sl-detail-title { font-size: 17px; font-weight: 700; color: #fff; }
.sl-detail-stepper {
  display: flex; align-items: center; padding: 10px 14px;
  background: rgba(255,255,255,0.05); border-radius: 12px;
  justify-content: space-between; gap: 12px;
}
.sl-detail-label { font-size: 13px; color: rgba(255,255,255,0.5); }

.sl-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.sl-cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px; padding: 4px 0;
}
.sl-cat-tile {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; padding: 16px 12px;
  text-align: center; cursor: pointer;
  font-size: 13px; font-weight: 500; color: #fff;
  transition: background .15s, transform .12s;
  min-height: 70px; display: flex; align-items: center; justify-content: center;
}
.sl-cat-tile:hover { background: rgba(255,255,255,0.11); transform: translateY(-1px); }

.sl-prod-item {
  display: flex; align-items: center; padding: 12px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  cursor: pointer; border-radius: 8px; transition: background .1s;
}
.sl-prod-item:hover { background: rgba(255,255,255,0.05); }
.sl-prod-name { flex: 1; font-size: 14px; color: #fff; }

.sl-quick-add-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 8px; border-radius: 8px;
  border: 1px dashed rgba(255,255,255,0.2);
  background: none; cursor: pointer;
  color: rgba(255,255,255,0.5); font-size: 13px;
  width: 100%; margin-top: 10px;
  transition: background .15s, color .15s; font-family: inherit;
}
.sl-quick-add-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }

.sl-name-inp {
  width: 100%; background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px; padding: 11px 14px;
  font-size: 15px; color: #fff; outline: none;
  font-family: inherit; transition: border-color .15s;
}
.sl-name-inp:focus { border-color: var(--primary-color, #03a9f4); }

.sl-section { margin-bottom: 24px; }
.sl-section-title {
  font-size: 11px; font-weight: 600; letter-spacing: 0.8px;
  text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 10px;
}
.sl-row {
  display: flex; align-items: center; padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06); gap: 8px;
}
.sl-row-name { flex: 1; font-size: 14px; color: #fff; }
.sl-row-sub { font-size: 11px; color: rgba(255,255,255,0.4); }
.sl-add-row { display: flex; gap: 8px; margin-top: 10px; }
.sl-add-row input, .sl-add-row select {
  flex: 1; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px; padding: 8px 12px;
  font-size: 13px; color: #fff; outline: none; font-family: inherit;
}
.sl-add-row input:focus { border-color: var(--primary-color, #03a9f4); }
.sl-add-row select { cursor: pointer; }
.sl-empty { text-align: center; padding: 20px; color: rgba(255,255,255,0.4); font-size: 13px; }
.sl-custom-row { margin-bottom: 16px; }
`;

function ensureModalStyles() {
  if (document.getElementById('sl-modal-styles')) return;
  const s = document.createElement('style');
  s.id = 'sl-modal-styles';
  s.textContent = MODAL_STYLES;
  document.head.appendChild(s);
}

/* ── Card styles (Shadow DOM) ───────────────────────────────── */
const CARD_STYLES = `
  :host { display: block; font-family: var(--primary-font-family, Roboto, sans-serif); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .card {
    background: var(--ha-card-background, var(--card-background-color, #1c1c1e));
    border-radius: var(--ha-card-border-radius, 12px);
    overflow: hidden; min-height: 120px; position: relative;
  }
  .header {
    display: flex; align-items: center;
    padding: 14px 16px 10px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.08));
    gap: 8px;
  }
  .header-title { flex: 1; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; color: var(--primary-text-color, #fff); }
  .sl-icon-btn {
    background: none; border: none; cursor: pointer;
    color: var(--secondary-text-color, rgba(255,255,255,0.5));
    padding: 6px; border-radius: 8px; display: flex; align-items: center;
    transition: background .15s, color .15s;
  }
  .sl-icon-btn:hover { background: rgba(255,255,255,0.07); color: var(--primary-text-color, #fff); }
  .filter-tabs { display: flex; padding: 8px 16px 0; gap: 6px; }
  .tab {
    background: none; border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
    border-radius: 20px; padding: 4px 12px; font-size: 12px; cursor: pointer;
    color: var(--secondary-text-color, rgba(255,255,255,0.55)); transition: all .15s;
  }
  .tab.active { background: var(--primary-color, #03a9f4); border-color: transparent; color: #fff; font-weight: 500; }
  .items-wrap { padding: 8px 0 80px; }
  .empty-msg { text-align: center; padding: 32px 20px; color: var(--secondary-text-color, rgba(255,255,255,0.4)); font-size: 13px; }
  .item {
    display: flex; align-items: center; padding: 11px 16px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.06));
    cursor: pointer; transition: background .12s; gap: 10px;
  }
  .item:hover { background: rgba(255,255,255,0.03); }
  .item-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .item.pending .item-dot { background: #ef4444; }
  .item.bought .item-dot { background: #22c55e; }
  .item-name { flex: 1; font-size: 14px; color: var(--primary-text-color, #fff); font-weight: 500; }
  .item.bought .item-name { text-decoration: line-through; color: var(--secondary-text-color, rgba(255,255,255,0.4)); }
  .item-qty { font-size: 12px; padding: 2px 8px; border-radius: 10px; min-width: 28px; text-align: center; }
  .item.bought .item-qty { background: rgba(34,197,94,0.12); color: #22c55e; }
  .item.pending .item-qty { background: rgba(239,68,68,0.12); color: #ef4444; }
  .fab {
    position: absolute; bottom: 16px; right: 16px;
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--primary-color, #03a9f4); border: none; cursor: pointer;
    color: #fff; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    transition: transform .12s, box-shadow .12s;
  }
  .fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(0,0,0,0.5); }
  .fab:active { transform: scale(0.95); }
`;

/* ═══════════════════════════════════════════════════════════════
   ShoppingListCard
   ═══════════════════════════════════════════════════════════════ */
class ShoppingListCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._data = { items: [], categories: [], products: [] };
    this._filter = 'all';
    this._hass = null;
    this._loaded = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._loaded) { this._loaded = true; this._load(); }
  }

  setConfig(config) { this._config = config; this._render(); }
  connectedCallback() { this._render(); }

  /* ── API ── */
  async _load() {
    try {
      const token = this._hass?.auth?.data?.access_token || '';
      const r = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        const d = await r.json();
        this._data = { items: d.items||[], categories: d.categories||[], products: d.products||[] };
      }
    } catch(e) { console.warn('Shopping List: load error', e); }
    this._render();
  }

  async _save() {
    try {
      const token = this._hass?.auth?.data?.access_token || '';
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(this._data),
      });
    } catch(e) { console.warn('Shopping List: save error', e); }
  }

  _t() { return getLang(this._hass); }
  _nextId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  _nameExists(name) {
    return this._data.items.some(i => i.name.toLowerCase() === name.toLowerCase());
  }

  /* ── Card render ── */
  _render() {
    const root = this.shadowRoot;
    root.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = CARD_STYLES;
    root.appendChild(style);

    const card = el('div', 'card');

    if (!this._loaded && !this._data.items.length) {
      card.appendChild(elTxt('div', this._t().loading, 'empty-msg'));
      root.appendChild(card);
      return;
    }

    card.appendChild(this._buildHeader());
    card.appendChild(this._buildFilterTabs());
    card.appendChild(this._buildItemsList());
    card.appendChild(this._buildFab());
    root.appendChild(card);
    ensureModalStyles();
  }

  _buildHeader() {
    const h = el('div', 'header');
    h.appendChild(elTxt('span', this._t().title, 'header-title'));
    const printBtn = iconBtn(ICONS.print, this._t().printList);
    printBtn.addEventListener('click', () => this._print());
    h.appendChild(printBtn);
    const settBtn = iconBtn(ICONS.settings, this._t().settings);
    settBtn.addEventListener('click', () => this._openSettings());
    h.appendChild(settBtn);
    return h;
  }

  _buildFilterTabs() {
    const t = this._t();
    const wrap = el('div', 'filter-tabs');
    [['all', t.allItems], ['pending', t.pending], ['bought', t.boughtItems]].forEach(([key, label]) => {
      const b = el('button', 'tab' + (this._filter === key ? ' active' : ''));
      b.textContent = label;
      b.addEventListener('click', () => { this._filter = key; this._render(); });
      wrap.appendChild(b);
    });
    return wrap;
  }

  _buildItemsList() {
    const wrap = el('div', 'items-wrap');
    let items = this._data.items;
    if (this._filter === 'pending') items = items.filter(i => !i.bought);
    else if (this._filter === 'bought') items = items.filter(i => i.bought);
    if (!items.length) {
      wrap.appendChild(elTxt('div', this._t().noItems, 'empty-msg'));
      return wrap;
    }
    [...items].sort((a, b) => (a.bought ? 1 : 0) - (b.bought ? 1 : 0)).forEach(item => {
      const row = el('div', 'item ' + (item.bought ? 'bought' : 'pending'));
      row.appendChild(el('span', 'item-dot'));
      row.appendChild(elTxt('span', item.name, 'item-name'));
      row.appendChild(elTxt('span', `${item.qty} ks`, 'item-qty'));
      row.addEventListener('click', () => this._openDetail(item));
      wrap.appendChild(row);
    });
    return wrap;
  }

  _buildFab() {
    const f = el('button', 'fab');
    f.innerHTML = ICONS.plus;
    f.title = this._t().add;
    f.addEventListener('click', () => this._openAddCats());
    return f;
  }

  /* ════════════════════════════════════════════════════════
     MODAL helpers — everything goes into document.body
     ════════════════════════════════════════════════════════ */

  _makeFullModal(title, onBack, onClose) {
    const bd = document.createElement('div');
    bd.className = 'sl-modal-backdrop';
    document.body.appendChild(bd);

    const modal = el('div', 'sl-modal');
    const header = el('div', 'sl-modal-header');

    if (onBack) {
      const backBtn = iconBtn(ICONS.back, this._t().back);
      backBtn.addEventListener('click', () => { bd.remove(); onBack(); });
      header.appendChild(backBtn);
    }
    header.appendChild(elTxt('span', title, 'sl-modal-title'));

    const closeBtn = iconBtn(ICONS.close, this._t().close);
    closeBtn.addEventListener('click', () => { bd.remove(); if (onClose) onClose(); });
    header.appendChild(closeBtn);

    const body = el('div', 'sl-modal-body');
    modal.appendChild(header);
    modal.appendChild(body);
    bd.appendChild(modal);
    return { bd, body };
  }

  _makeSheet() {
    const bd = document.createElement('div');
    bd.className = 'sl-sheet-backdrop';
    document.body.appendChild(bd);
    bd.addEventListener('click', e => { if (e.target === bd) bd.remove(); });
    const sheet = el('div', 'sl-sheet');
    bd.appendChild(sheet);
    return { bd, sheet };
  }

  /* ── Detail bottom sheet ── */
  _openDetail(item) {
    const t = this._t();
    const { bd, sheet } = this._makeSheet();

    sheet.appendChild(elTxt('div', item.name, 'sl-detail-title'));

    const stepperWrap = el('div', 'sl-detail-stepper');
    stepperWrap.appendChild(elTxt('span', t.qtyLabel, 'sl-detail-label'));
    const stepper = el('div', 'sl-stepper');
    const minus = el('button', 'sl-step-btn'); minus.textContent = '−';
    const valEl = elTxt('span', item.qty, 'sl-qty-val');
    const plus = el('button', 'sl-step-btn'); plus.textContent = '+';
    minus.addEventListener('click', () => { if (item.qty > 1) { item.qty--; valEl.textContent = item.qty; } });
    plus.addEventListener('click', () => { item.qty++; valEl.textContent = item.qty; });
    stepper.append(minus, valEl, plus);
    stepperWrap.appendChild(stepper);
    sheet.appendChild(stepperWrap);

    const actions = el('div', 'sl-actions');

    const toggleBtn = btn(item.bought ? t.markPending : t.markBought, 'sl-btn sl-btn-primary');
    toggleBtn.addEventListener('click', () => {
      item.bought = !item.bought; this._save(); bd.remove(); this._render();
    });
    const saveBtn = btn(t.save, 'sl-btn sl-btn-secondary');
    saveBtn.addEventListener('click', () => { this._save(); bd.remove(); this._render(); });
    const delBtn = btn(t.delete, 'sl-btn sl-btn-danger');
    delBtn.addEventListener('click', () => {
      if (!confirm(t.confirmDelete)) return;
      this._data.items = this._data.items.filter(i => i.id !== item.id);
      this._save(); bd.remove(); this._render();
    });
    const cancelBtn = btn(t.cancel, 'sl-btn sl-btn-ghost');
    cancelBtn.style.flex = '0 0 auto';
    cancelBtn.addEventListener('click', () => bd.remove());

    actions.append(cancelBtn, toggleBtn, saveBtn, delBtn);
    sheet.appendChild(actions);
  }

  /* ── ADD: category list ── */
  _openAddCats() {
    const t = this._t();
    const { bd, body } = this._makeFullModal(t.addFromCatalog, null, null);

    const customBtn = btn(t.customItem, 'sl-btn sl-btn-secondary');
    customBtn.classList.add('sl-custom-row');
    customBtn.style.width = '100%';
    customBtn.addEventListener('click', () => { bd.remove(); this._openQtyPopup(null, null); });
    body.appendChild(customBtn);

    if (!this._data.categories.length) {
      body.appendChild(elTxt('p', t.noCats, 'sl-empty'));
    } else {
      const grid = el('div', 'sl-cat-grid');
      this._data.categories.forEach(cat => {
        const tile = el('div', 'sl-cat-tile');
        tile.textContent = cat;
        tile.addEventListener('click', () => { bd.remove(); this._openAddProds(cat); });
        grid.appendChild(tile);
      });
      body.appendChild(grid);
    }
  }

  /* ── ADD: products in category ── */
  _openAddProds(cat) {
    const t = this._t();
    const { bd, body } = this._makeFullModal(cat, () => this._openAddCats(), null);

    const prods = this._data.products.filter(p => p.cat === cat);
    if (!prods.length) {
      body.appendChild(elTxt('p', t.noProds, 'sl-empty'));
    } else {
      prods.forEach(prod => {
        const existing = this._data.items.find(i => i.name.toLowerCase() === prod.name.toLowerCase());
        const row = el('div', 'sl-prod-item');
        row.appendChild(elTxt('span', prod.name, 'sl-prod-name'));
        if (existing) {
          const badge = elTxt('span', `${existing.qty} ks`);
          badge.style.cssText = `font-size:12px;padding:2px 8px;border-radius:10px;margin-left:8px;flex-shrink:0;background:${existing.bought ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'};color:${existing.bought ? '#22c55e' : '#ef4444'};`;
          row.appendChild(badge);
        }
        row.addEventListener('click', () => { bd.remove(); this._openQtyPopup(prod.name, cat); });
        body.appendChild(row);
      });
    }

    const quickBtn = el('button', 'sl-quick-add-btn');
    quickBtn.innerHTML = ICONS.plus + `<span>${t.customItem}</span>`;
    quickBtn.addEventListener('click', () => { bd.remove(); this._openQtyPopup(null, cat); });
    body.appendChild(quickBtn);
  }

  /* ── ADD: qty bottom sheet ── */
  _openQtyPopup(prefillName, prefillCat) {
    const t = this._t();
    // If item already in list, load its current qty
    const existingItem = prefillName
      ? this._data.items.find(i => i.name.toLowerCase() === prefillName.toLowerCase())
      : null;
    let qty = existingItem ? existingItem.qty : 1;
    let finalName = prefillName || '';
    const { bd, sheet } = this._makeSheet();

    if (!prefillName) {
      const nameInp = document.createElement('input');
      nameInp.className = 'sl-name-inp';
      nameInp.type = 'text';
      nameInp.placeholder = t.itemName;
      nameInp.addEventListener('input', () => { finalName = nameInp.value.trim(); });
      sheet.appendChild(nameInp);
      setTimeout(() => nameInp.focus(), 80);
    } else {
      sheet.appendChild(elTxt('div', prefillName, 'sl-detail-title'));
    }

    const stepperWrap = el('div', 'sl-detail-stepper');
    stepperWrap.appendChild(elTxt('span', t.qtyLabel, 'sl-detail-label'));
    const stepper = el('div', 'sl-stepper');
    const minus = el('button', 'sl-step-btn'); minus.textContent = '−';
    const valEl = elTxt('span', qty, 'sl-qty-val');
    const plus = el('button', 'sl-step-btn'); plus.textContent = '+';
    minus.addEventListener('click', () => { if (qty > 1) { qty--; valEl.textContent = qty; } });
    plus.addEventListener('click', () => { qty++; valEl.textContent = qty; });
    stepper.append(minus, valEl, plus);
    stepperWrap.appendChild(stepper);
    sheet.appendChild(stepperWrap);

    const actions = el('div', 'sl-actions');

    const addMore = btn(t.addMore, 'sl-btn sl-btn-secondary');
    addMore.addEventListener('click', () => {
      if (!this._addItem(finalName, prefillCat, qty)) return;
      bd.remove(); this._openAddCats();
    });
    const confirm_ = btn(t.confirm, 'sl-btn sl-btn-primary');
    confirm_.addEventListener('click', () => {
      if (!this._addItem(finalName, prefillCat, qty)) return;
      bd.remove();
    });
    const cancelBtn = btn(t.cancel, 'sl-btn sl-btn-ghost');
    cancelBtn.style.flex = '0 0 auto';
    cancelBtn.addEventListener('click', () => bd.remove());

    actions.append(cancelBtn, addMore, confirm_);
    sheet.appendChild(actions);
  }

  _addItem(name, cat, qty) {
    if (!name) return false;
    const existing = this._data.items.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      // Update qty on existing item instead of blocking
      existing.qty = qty;
      existing.bought = false; // unmark if was bought
    } else {
      this._data.items.push({ id: this._nextId(), name, cat: cat || '', qty, bought: false });
    }
    this._save(); this._render();
    return true;
  }

  /* ── SETTINGS full modal ── */
  _openSettings() {
    const t = this._t();
    const { body } = this._makeFullModal(t.settings, null, null);

    const sec0 = el('div', 'sl-section');
    sec0.appendChild(elTxt('div', t.boughtItems, 'sl-section-title'));
    const clearBtn = btn(t.clearBought, 'sl-btn sl-btn-danger');
    clearBtn.style.width = '100%';
    clearBtn.addEventListener('click', () => {
      if (!confirm(t.confirmDelete)) return;
      this._data.items = this._data.items.filter(i => !i.bought);
      this._save(); this._render();
    });
    sec0.appendChild(clearBtn);
    body.appendChild(sec0);

    const sec1 = el('div', 'sl-section');
    sec1.appendChild(elTxt('div', t.categories, 'sl-section-title'));
    this._buildCatRows(sec1);
    body.appendChild(sec1);

    const sec2 = el('div', 'sl-section');
    sec2.appendChild(elTxt('div', t.products, 'sl-section-title'));
    this._buildProdRows(sec2);
    body.appendChild(sec2);
  }

  _buildCatRows(parent) {
    const t = this._t();
    const list = el('div');
    const renderList = () => {
      list.innerHTML = '';
      if (!this._data.categories.length) { list.appendChild(elTxt('div', t.noCats, 'sl-empty')); }
      this._data.categories.forEach(cat => {
        const row = el('div', 'sl-row');
        row.appendChild(elTxt('span', cat, 'sl-row-name'));
        const count = this._data.products.filter(p => p.cat === cat).length;
        row.appendChild(elTxt('span', `${count} prod.`, 'sl-row-sub'));
        const del = iconBtn(ICONS.trash, t.delete);
        del.addEventListener('click', () => {
          if (!confirm(t.confirmDelete)) return;
          this._data.categories = this._data.categories.filter(c => c !== cat);
          this._data.products = this._data.products.filter(p => p.cat !== cat);
          this._save(); renderList();
        });
        row.appendChild(del);
        list.appendChild(row);
      });
    };
    renderList();
    parent.appendChild(list);

    const addRow = el('div', 'sl-add-row');
    const catInp = inp('text', t.catName);
    const addBtn = btn('+', 'sl-btn sl-btn-primary');
    addBtn.style.flex = '0 0 44px';
    addBtn.addEventListener('click', () => {
      const v = catInp.value.trim();
      if (!v || this._data.categories.includes(v)) return;
      this._data.categories.push(v); this._save(); catInp.value = ''; renderList();
    });
    catInp.addEventListener('keydown', e => { if (e.key === 'Enter') addBtn.click(); });
    addRow.append(catInp, addBtn);
    parent.appendChild(addRow);
  }

  _buildProdRows(parent) {
    const t = this._t();
    const list = el('div');
    const renderList = () => {
      list.innerHTML = '';
      if (!this._data.products.length) { list.appendChild(elTxt('div', t.noProds, 'sl-empty')); }
      this._data.products.forEach(prod => {
        const row = el('div', 'sl-row');
        row.appendChild(elTxt('span', prod.name, 'sl-row-name'));
        row.appendChild(elTxt('span', prod.cat, 'sl-row-sub'));
        const del = iconBtn(ICONS.trash, t.delete);
        del.addEventListener('click', () => {
          if (!confirm(t.confirmDelete)) return;
          this._data.products = this._data.products.filter(p => !(p.name === prod.name && p.cat === prod.cat));
          this._save(); renderList();
        });
        row.appendChild(del);
        list.appendChild(row);
      });
    };
    renderList();
    parent.appendChild(list);

    const addRow = el('div', 'sl-add-row');
    const nameInp = inp('text', t.prodName);
    const catSel = document.createElement('select');
    const renderSel = () => {
      catSel.innerHTML = `<option value="">${t.selectCat}</option>`;
      this._data.categories.forEach(c => {
        const o = document.createElement('option'); o.value = c; o.textContent = c; catSel.appendChild(o);
      });
    };
    renderSel();
    const addBtn = btn('+', 'sl-btn sl-btn-primary');
    addBtn.style.flex = '0 0 44px';
    addBtn.addEventListener('click', () => {
      const name = nameInp.value.trim(); const cat = catSel.value;
      if (!name || !cat) return;
      if (this._data.products.some(p => p.name.toLowerCase() === name.toLowerCase() && p.cat === cat)) return;
      this._data.products.push({ name, cat }); this._save(); nameInp.value = ''; renderList(); renderSel();
    });
    nameInp.addEventListener('keydown', e => { if (e.key === 'Enter') addBtn.click(); });
    addRow.append(nameInp, catSel, addBtn);
    parent.appendChild(addRow);
  }

  /* ── Print ── */
  _print() {
    const t = this._t();
    const pending = this._data.items.filter(i => !i.bought);
    const bought = this._data.items.filter(i => i.bought);
    const buildSection = (title, items) => {
      if (!items.length) return '';
      const rows = items.map(i =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;font-size:14px;">${i.name}</td>
         <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;">${i.qty} ks</td>
         <td style="padding:6px 0;border-bottom:1px solid #eee;width:60px;">☐</td></tr>`
      ).join('');
      return `<h3 style="margin:20px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#888;">${title}</h3>
              <table style="width:100%;border-collapse:collapse;">${rows}</table>`;
    };
    const html = `<!DOCTYPE html><html><head><title>${t.title}</title>
      <style>body{font-family:sans-serif;padding:24px;max-width:480px;margin:auto;}
      h1{font-size:20px;margin-bottom:4px;}p{color:#888;font-size:12px;margin:0 0 16px;}
      @media print{body{padding:0;}}</style></head><body>
      <h1>${t.title}</h1><p>${new Date().toLocaleDateString()}</p>
      ${buildSection(t.pending, pending)}${bought.length ? buildSection(t.boughtItems, bought) : ''}
      <script>window.print();<\/script></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  }

  static getConfigElement() { return document.createElement('div'); }
  static getStubConfig() { return {}; }
}

customElements.define('shopping-list-card', ShoppingListCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'shopping-list-card', name: 'Shopping List', description: 'Shopping list with categories and predefined products.' });
