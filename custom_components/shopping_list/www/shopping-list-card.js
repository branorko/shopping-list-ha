/* ============================================================
   shopping-list-card.js  —  Home Assistant Lovelace Card
   Shopping List with categories, predefined products, print
   ============================================================ */

const API_URL = '/api/shopping_list/data';

/* ── i18n ──────────────────────────────────────────────────── */
const TRANSLATIONS = {
  sk: {
    title: 'Nákupný zoznam',
    add: 'Pridať položku',
    settings: 'Nastavenia',
    bought: 'Kúpené',
    delete: 'Zmazať',
    edit: 'Upraviť',
    save: 'Uložiť',
    cancel: 'Zrušiť',
    back: 'Späť',
    close: 'Zatvoriť',
    qty: 'Počet ks',
    itemName: 'Názov položky',
    markBought: 'Označiť za kúpené',
    markPending: 'Označiť ako nekúpené',
    confirmDelete: 'Naozaj zmazať?',
    categories: 'Kategórie',
    products: 'Preddefinovaný tovar',
    catName: 'Názov kategórie',
    addCat: 'Pridať kategóriu',
    prodName: 'Názov tovaru',
    prodCat: 'Kategória',
    addProd: 'Pridať tovar',
    selectCat: 'Vyberte kategóriu',
    addFromCatalog: 'Pridať z katalógu',
    customItem: 'Vlastná položka',
    qtyLabel: 'Počet kusov',
    confirm: 'Potvrdiť',
    addMore: 'Pridať ďalší',
    backToCats: 'Späť na kategórie',
    exitAdd: 'Ukončiť pridávanie',
    noItems: 'Zoznam je prázdny. Kliknite + a pridajte položku.',
    noCats: 'Zatiaľ žiadne kategórie.',
    noProds: 'Zatiaľ žiadne produkty.',
    duplicate: 'Položka s týmto názvom už v zozname existuje.',
    printList: 'Tlačiť zoznam',
    allItems: 'Všetky položky',
    pending: 'Na kúpenie',
    boughtItems: 'Kúpené',
    clearBought: 'Odstrániť kúpené',
    loading: 'Načítavam…',
  },
  en: {
    title: 'Shopping List',
    add: 'Add item',
    settings: 'Settings',
    bought: 'Bought',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    close: 'Close',
    qty: 'Qty',
    itemName: 'Item name',
    markBought: 'Mark as bought',
    markPending: 'Mark as not bought',
    confirmDelete: 'Really delete?',
    categories: 'Categories',
    products: 'Predefined products',
    catName: 'Category name',
    addCat: 'Add category',
    prodName: 'Product name',
    prodCat: 'Category',
    addProd: 'Add product',
    selectCat: 'Select category',
    addFromCatalog: 'Add from catalog',
    customItem: 'Custom item',
    qtyLabel: 'Quantity',
    confirm: 'Confirm',
    addMore: 'Add more',
    backToCats: 'Back to categories',
    exitAdd: 'Exit adding',
    noItems: 'List is empty. Click + to add an item.',
    noCats: 'No categories yet.',
    noProds: 'No products yet.',
    duplicate: 'An item with this name already exists in the list.',
    printList: 'Print list',
    allItems: 'All items',
    pending: 'To buy',
    boughtItems: 'Bought',
    clearBought: 'Remove bought',
    loading: 'Loading…',
  },
  cs: {
    title: 'Nákupní seznam',
    add: 'Přidat položku',
    settings: 'Nastavení',
    bought: 'Koupeno',
    delete: 'Smazat',
    edit: 'Upravit',
    save: 'Uložit',
    cancel: 'Zrušit',
    back: 'Zpět',
    close: 'Zavřít',
    qty: 'Počet ks',
    itemName: 'Název položky',
    markBought: 'Označit jako koupené',
    markPending: 'Označit jako nekoupené',
    confirmDelete: 'Opravdu smazat?',
    categories: 'Kategorie',
    products: 'Předdefinované zboží',
    catName: 'Název kategorie',
    addCat: 'Přidat kategorii',
    prodName: 'Název zboží',
    prodCat: 'Kategorie',
    addProd: 'Přidat zboží',
    selectCat: 'Vyberte kategorii',
    addFromCatalog: 'Přidat z katalogu',
    customItem: 'Vlastní položka',
    qtyLabel: 'Počet kusů',
    confirm: 'Potvrdit',
    addMore: 'Přidat další',
    backToCats: 'Zpět na kategorie',
    exitAdd: 'Ukončit přidávání',
    noItems: 'Seznam je prázdný. Klikněte + a přidejte položku.',
    noCats: 'Zatím žádné kategorie.',
    noProds: 'Zatím žádné produkty.',
    duplicate: 'Položka s tímto názvem již v seznamu existuje.',
    printList: 'Tisknout seznam',
    allItems: 'Všechny položky',
    pending: 'K nákupu',
    boughtItems: 'Koupeno',
    clearBought: 'Odebrat koupené',
    loading: 'Načítám…',
  },
};

function getLang(hass) {
  const lang = hass?.locale?.language || navigator.language || 'en';
  const code = lang.slice(0, 2).toLowerCase();
  return TRANSLATIONS[code] || TRANSLATIONS['en'];
}

/* ── DOM helpers ────────────────────────────────────────────── */
function el(tag, cls = '') { const e = document.createElement(tag); if (cls) e.className = cls; return e; }
function elTxt(tag, text, cls = '') { const e = el(tag, cls); e.textContent = text; return e; }
function btn(label, cls = 'btn') { const b = el('button', cls); b.textContent = label; return b; }
function inp(type, ph = '') { const i = document.createElement('input'); i.type = type; i.placeholder = ph; return i; }
function iconBtn(icon, title, cls = 'icon-btn') {
  const b = el('button', cls); b.title = title; b.innerHTML = icon; return b;
}

/* ── Icons (inline SVG) ─────────────────────────────────────── */
const ICONS = {
  settings: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  undo: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
  print: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  back: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
  close: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

/* ── Styles ─────────────────────────────────────────────────── */
const STYLES = `
  :host { display: block; font-family: var(--primary-font-family, 'Roboto', sans-serif); }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .card {
    background: var(--ha-card-background, var(--card-background-color, #1c1c1e));
    border-radius: var(--ha-card-border-radius, 12px);
    padding: 0;
    overflow: hidden;
    min-height: 200px;
  }

  /* ── Header ── */
  .header {
    display: flex;
    align-items: center;
    padding: 14px 16px 10px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.08));
    gap: 8px;
  }
  .header-title {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: var(--primary-text-color, #fff);
  }
  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary-text-color, rgba(255,255,255,0.5));
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    transition: background .15s, color .15s;
  }
  .icon-btn:hover { background: rgba(255,255,255,0.07); color: var(--primary-text-color, #fff); }

  /* ── Filter tabs ── */
  .filter-tabs {
    display: flex;
    padding: 8px 16px 0;
    gap: 6px;
  }
  .tab {
    background: none;
    border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 12px;
    cursor: pointer;
    color: var(--secondary-text-color, rgba(255,255,255,0.55));
    transition: all .15s;
  }
  .tab.active {
    background: var(--primary-color, #03a9f4);
    border-color: transparent;
    color: #fff;
    font-weight: 500;
  }

  /* ── Items list ── */
  .items-wrap { padding: 8px 0 80px; }
  .empty-msg {
    text-align: center;
    padding: 32px 20px;
    color: var(--secondary-text-color, rgba(255,255,255,0.4));
    font-size: 13px;
  }

  /* ── Single item ── */
  .item {
    display: flex;
    align-items: center;
    padding: 11px 16px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.06));
    cursor: pointer;
    transition: background .12s;
    gap: 10px;
    position: relative;
  }
  .item:hover { background: rgba(255,255,255,0.03); }
  .item-dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
  }
  .item.pending .item-dot { background: #ef4444; }
  .item.bought .item-dot { background: #22c55e; }
  .item-name {
    flex: 1;
    font-size: 14px;
    color: var(--primary-text-color, #fff);
    font-weight: 500;
  }
  .item.bought .item-name {
    text-decoration: line-through;
    color: var(--secondary-text-color, rgba(255,255,255,0.4));
  }
  .item-qty {
    font-size: 12px;
    color: var(--secondary-text-color, rgba(255,255,255,0.5));
    background: rgba(255,255,255,0.07);
    padding: 2px 8px;
    border-radius: 10px;
    min-width: 28px;
    text-align: center;
  }
  .item.bought .item-qty { background: rgba(34,197,94,0.12); color: #22c55e; }
  .item.pending .item-qty { background: rgba(239,68,68,0.12); color: #ef4444; }

  /* ── FAB + ── */
  .fab {
    position: absolute;
    bottom: 16px;
    right: 16px;
    width: 48px; height: 48px;
    border-radius: 50%;
    background: var(--primary-color, #03a9f4);
    border: none;
    cursor: pointer;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    transition: transform .12s, box-shadow .12s;
    z-index: 10;
  }
  .fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(0,0,0,0.5); }
  .fab:active { transform: scale(0.95); }

  /* ── Overlay / Modal ── */
  .overlay {
    position: absolute; inset: 0;
    background: var(--ha-card-background, #1c1c1e);
    z-index: 20;
    overflow-y: auto;
    display: flex; flex-direction: column;
  }
  .overlay-header {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.08));
    gap: 8px;
    flex-shrink: 0;
  }
  .overlay-title {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    color: var(--primary-text-color, #fff);
  }
  .overlay-body { padding: 16px; flex: 1; }

  /* ── Category grid (add screen) ── */
  .cat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
    padding: 4px 0;
  }
  .cat-tile {
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--divider-color, rgba(255,255,255,0.1));
    border-radius: 12px;
    padding: 16px 12px;
    text-align: center;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text-color, #fff);
    transition: background .15s, transform .12s;
    min-height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cat-tile:hover { background: rgba(255,255,255,0.1); transform: translateY(-1px); }

  /* ── Product list (inside category) ── */
  .prod-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.06));
    cursor: pointer;
    transition: background .1s;
    border-radius: 8px;
    padding-left: 8px;
  }
  .prod-item:hover { background: rgba(255,255,255,0.05); }
  .prod-name { flex: 1; font-size: 14px; color: var(--primary-text-color, #fff); }

  /* ── Quick-add button inside category ── */
  .quick-add-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 8px;
    border-radius: 8px;
    border: 1px dashed var(--divider-color, rgba(255,255,255,0.2));
    background: none;
    cursor: pointer;
    color: var(--secondary-text-color, rgba(255,255,255,0.5));
    font-size: 13px;
    width: 100%;
    margin-top: 8px;
    transition: background .15s, color .15s;
  }
  .quick-add-btn:hover { background: rgba(255,255,255,0.05); color: var(--primary-text-color, #fff); }

  /* ── Qty popup ── */
  .qty-popup {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
  }
  .qty-box {
    background: var(--ha-card-background, #2a2a2e);
    border-radius: 16px;
    padding: 24px;
    width: 280px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  }
  .qty-box-title { font-size: 16px; font-weight: 600; color: var(--primary-text-color, #fff); }
  .qty-stepper {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
  }
  .step-btn {
    width: 40px; height: 40px;
    border-radius: 50%;
    border: 1px solid var(--divider-color, rgba(255,255,255,0.2));
    background: rgba(255,255,255,0.06);
    color: var(--primary-text-color, #fff);
    font-size: 22px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .12s;
  }
  .step-btn:hover { background: rgba(255,255,255,0.12); }
  .qty-val {
    font-size: 28px;
    font-weight: 700;
    color: var(--primary-text-color, #fff);
    min-width: 48px;
    text-align: center;
  }
  .qty-box-actions { display: flex; gap: 8px; }

  /* ── Buttons ── */
  .btn {
    border: none;
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity .12s, transform .1s;
    flex: 1;
  }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: var(--primary-color, #03a9f4); color: #fff; }
  .btn-secondary { background: rgba(255,255,255,0.08); color: var(--primary-text-color, #fff); }
  .btn-danger { background: rgba(239,68,68,0.15); color: #ef4444; }
  .btn-ghost { background: none; border: 1px solid var(--divider-color, rgba(255,255,255,0.15)); color: var(--secondary-text-color, rgba(255,255,255,0.6)); }

  /* ── Settings sections ── */
  .settings-section {
    margin-bottom: 24px;
  }
  .settings-section-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--secondary-text-color, rgba(255,255,255,0.45));
    margin-bottom: 10px;
  }
  .settings-row {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.06));
    gap: 8px;
  }
  .settings-row-name { flex: 1; font-size: 14px; color: var(--primary-text-color, #fff); }
  .settings-row-sub { font-size: 11px; color: var(--secondary-text-color, rgba(255,255,255,0.4)); }
  .add-row {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
  .add-row input {
    flex: 1;
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: var(--primary-text-color, #fff);
    outline: none;
  }
  .add-row input:focus { border-color: var(--primary-color, #03a9f4); }
  .add-row select {
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: var(--primary-text-color, #fff);
    outline: none;
    cursor: pointer;
  }

  /* ── Item detail popup ── */
  .detail-popup {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: flex-end;
    z-index: 30;
  }
  .detail-box {
    background: var(--ha-card-background, #2a2a2e);
    border-radius: 20px 20px 0 0;
    padding: 20px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
    animation: slideUp .2s ease;
  }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .detail-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--primary-text-color, #fff);
  }
  .detail-actions { display: flex; flex-direction: column; gap: 8px; }
  .detail-stepper {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 10px 16px;
    justify-content: space-between;
  }
  .detail-label { font-size: 13px; color: var(--secondary-text-color, rgba(255,255,255,0.5)); }

  /* ── Error toast ── */
  .toast {
    position: absolute;
    bottom: 80px; left: 16px; right: 16px;
    background: #ef4444;
    color: #fff;
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 13px;
    z-index: 50;
    text-align: center;
    animation: fadeInUp .2s ease;
  }
  @keyframes fadeInUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
`;

/* ═══════════════════════════════════════════════════════════════
   ShoppingListCard — LitElement-free Web Component
   ═══════════════════════════════════════════════════════════════ */
class ShoppingListCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._data = { items: [], categories: [], products: [] };
    this._filter = 'all'; // 'all' | 'pending' | 'bought'
    this._view = 'main'; // 'main' | 'settings' | 'add-cats' | 'add-prods'
    this._addCatCtx = null; // category name when browsing products
    this._hass = null;
    this._loaded = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._loaded) { this._loaded = true; this._load(); }
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  connectedCallback() { this._render(); }

  /* ── API ────────────────────────────────────────────────────── */
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

  /* ── Helpers ────────────────────────────────────────────────── */
  _t() { return getLang(this._hass); }

  _nextId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  _nameExists(name, excludeId = null) {
    return this._data.items.some(i =>
      i.name.toLowerCase() === name.toLowerCase() && i.id !== excludeId
    );
  }

  _toast(msg) {
    const t = el('div', 'toast'); t.textContent = msg;
    this.shadowRoot.querySelector('.card').appendChild(t);
    setTimeout(() => t.remove(), 2800);
  }

  /* ── Master render ──────────────────────────────────────────── */
  _render() {
    const root = this.shadowRoot;
    root.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = STYLES;
    root.appendChild(style);

    const card = el('div', 'card');
    card.style.position = 'relative';

    if (!this._loaded && !this._data.items.length) {
      card.appendChild(elTxt('div', this._t().loading, 'empty-msg'));
      root.appendChild(card);
      return;
    }

    // Main view
    card.appendChild(this._buildHeader());
    card.appendChild(this._buildFilterTabs());
    card.appendChild(this._buildItemsList());
    card.appendChild(this._buildFab());

    // Overlays
    if (this._view === 'settings') card.appendChild(this._buildSettings());
    else if (this._view === 'add-cats') card.appendChild(this._buildAddCats());
    else if (this._view === 'add-prods') card.appendChild(this._buildAddProds());

    root.appendChild(card);
  }

  /* ── Header ─────────────────────────────────────────────────── */
  _buildHeader() {
    const h = el('div', 'header');
    h.appendChild(elTxt('span', this._t().title, 'header-title'));

    const printBtn = iconBtn(ICONS.print, this._t().printList);
    printBtn.addEventListener('click', () => this._print());
    h.appendChild(printBtn);

    const settBtn = iconBtn(ICONS.settings, this._t().settings);
    settBtn.addEventListener('click', () => { this._view = 'settings'; this._render(); });
    h.appendChild(settBtn);
    return h;
  }

  /* ── Filter tabs ─────────────────────────────────────────────── */
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

  /* ── Items list ─────────────────────────────────────────────── */
  _buildItemsList() {
    const wrap = el('div', 'items-wrap');
    const t = this._t();
    let items = this._data.items;
    if (this._filter === 'pending') items = items.filter(i => !i.bought);
    else if (this._filter === 'bought') items = items.filter(i => i.bought);

    if (!items.length) {
      wrap.appendChild(elTxt('div', t.noItems, 'empty-msg'));
      return wrap;
    }

    // Sort: pending first, then bought
    items = [...items].sort((a, b) => (a.bought ? 1 : 0) - (b.bought ? 1 : 0));

    items.forEach(item => {
      const row = el('div', 'item ' + (item.bought ? 'bought' : 'pending'));
      const dot = el('span', 'item-dot');
      row.appendChild(dot);
      row.appendChild(elTxt('span', item.name, 'item-name'));
      const qty = elTxt('span', `${item.qty} ks`, 'item-qty');
      row.appendChild(qty);
      row.addEventListener('click', () => this._showDetail(item));
      wrap.appendChild(row);
    });
    return wrap;
  }

  /* ── Item detail popup ──────────────────────────────────────── */
  _showDetail(item) {
    const card = this.shadowRoot.querySelector('.card');
    const t = this._t();
    const backdrop = el('div', 'detail-popup');
    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });

    const box = el('div', 'detail-box');
    box.appendChild(elTxt('div', item.name, 'detail-title'));

    // Qty stepper
    const stepper = el('div', 'detail-stepper');
    stepper.appendChild(elTxt('span', t.qtyLabel, 'detail-label'));
    const stepWrap = el('div', 'qty-stepper');
    const minus = el('button', 'step-btn'); minus.textContent = '−';
    const valEl = elTxt('span', item.qty, 'qty-val');
    const plus = el('button', 'step-btn'); plus.textContent = '+';
    minus.addEventListener('click', () => { if (item.qty > 1) { item.qty--; valEl.textContent = item.qty; } });
    plus.addEventListener('click', () => { item.qty++; valEl.textContent = item.qty; });
    stepWrap.append(minus, valEl, plus);
    stepper.appendChild(stepWrap);
    box.appendChild(stepper);

    // Actions
    const actions = el('div', 'detail-actions');

    const toggleBtn = btn(item.bought ? t.markPending : t.markBought, 'btn btn-primary');
    toggleBtn.addEventListener('click', () => {
      item.bought = !item.bought;
      this._save(); backdrop.remove(); this._render();
    });

    const saveBtn = btn(t.save, 'btn btn-secondary');
    saveBtn.addEventListener('click', () => {
      this._save(); backdrop.remove(); this._render();
    });

    const delBtn = btn(t.delete, 'btn btn-danger');
    delBtn.addEventListener('click', () => {
      if (!confirm(t.confirmDelete)) return;
      this._data.items = this._data.items.filter(i => i.id !== item.id);
      this._save(); backdrop.remove(); this._render();
    });

    const cancelBtn = btn(t.cancel, 'btn btn-ghost');
    cancelBtn.addEventListener('click', () => backdrop.remove());

    actions.append(toggleBtn, saveBtn, delBtn, cancelBtn);
    box.appendChild(actions);
    backdrop.appendChild(box);
    card.appendChild(backdrop);
  }

  /* ── FAB ─────────────────────────────────────────────────────── */
  _buildFab() {
    const f = el('button', 'fab');
    f.innerHTML = ICONS.plus;
    f.title = this._t().add;
    f.addEventListener('click', () => { this._view = 'add-cats'; this._render(); });
    return f;
  }

  /* ── ADD FLOW — Category selection ─────────────────────────── */
  _buildAddCats() {
    const t = this._t();
    const overlay = el('div', 'overlay');

    const header = el('div', 'overlay-header');
    const backBtn = iconBtn(ICONS.back, t.back);
    backBtn.addEventListener('click', () => { this._view = 'main'; this._render(); });
    const closeBtn = iconBtn(ICONS.close, t.close);
    closeBtn.addEventListener('click', () => { this._view = 'main'; this._render(); });
    header.append(backBtn, elTxt('span', t.addFromCatalog, 'overlay-title'), closeBtn);
    overlay.appendChild(header);

    const body = el('div', 'overlay-body');

    // Custom item shortcut
    const customBtn = btn(t.customItem, 'btn btn-secondary');
    customBtn.style.width = '100%';
    customBtn.style.marginBottom = '16px';
    customBtn.addEventListener('click', () => this._showQtyPopup(null, null));
    body.appendChild(customBtn);

    if (this._data.categories.length === 0) {
      body.appendChild(elTxt('p', t.noCats, 'empty-msg'));
    } else {
      const grid = el('div', 'cat-grid');
      this._data.categories.forEach(cat => {
        const tile = el('div', 'cat-tile');
        tile.textContent = cat;
        tile.addEventListener('click', () => { this._addCatCtx = cat; this._view = 'add-prods'; this._render(); });
        grid.appendChild(tile);
      });
      body.appendChild(grid);
    }

    overlay.appendChild(body);
    return overlay;
  }

  /* ── ADD FLOW — Products in category ───────────────────────── */
  _buildAddProds() {
    const t = this._t();
    const cat = this._addCatCtx;
    const overlay = el('div', 'overlay');

    const header = el('div', 'overlay-header');
    const backBtn = iconBtn(ICONS.back, t.backToCats);
    backBtn.addEventListener('click', () => { this._view = 'add-cats'; this._render(); });
    const closeBtn = iconBtn(ICONS.close, t.exitAdd);
    closeBtn.addEventListener('click', () => { this._view = 'main'; this._render(); });
    header.append(backBtn, elTxt('span', cat, 'overlay-title'), closeBtn);
    overlay.appendChild(header);

    const body = el('div', 'overlay-body');
    const prods = this._data.products.filter(p => p.cat === cat);

    if (prods.length === 0) {
      body.appendChild(elTxt('p', t.noProds, 'empty-msg'));
    } else {
      prods.forEach(prod => {
        const row = el('div', 'prod-item');
        row.appendChild(elTxt('span', prod.name, 'prod-name'));
        row.addEventListener('click', () => this._showQtyPopup(prod.name, cat));
        body.appendChild(row);
      });
    }

    // Quick-add product under this category
    const quickBtn = el('button', 'quick-add-btn');
    quickBtn.innerHTML = ICONS.plus + `<span>${t.customItem} + ${t.addProd}</span>`;
    quickBtn.addEventListener('click', () => this._showQtyPopup(null, cat));
    body.appendChild(quickBtn);

    overlay.appendChild(body);
    return overlay;
  }

  /* ── QTY POPUP (confirm add) ────────────────────────────────── */
  _showQtyPopup(prefillName, prefillCat) {
    const t = this._t();
    const card = this.shadowRoot.querySelector('.card');
    let qty = 1;
    let finalName = prefillName || '';

    const backdrop = el('div', 'qty-popup');
    const box = el('div', 'qty-box');

    // Name input (if no prefill)
    if (!prefillName) {
      const nameInp = inp('text', t.itemName);
      nameInp.style.cssText = 'width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:8px 12px;font-size:14px;color:var(--primary-text-color,#fff);outline:none;';
      nameInp.addEventListener('input', () => { finalName = nameInp.value.trim(); });
      box.appendChild(nameInp);
      setTimeout(() => nameInp.focus(), 50);
    } else {
      box.appendChild(elTxt('div', prefillName, 'qty-box-title'));
    }

    // Stepper
    const stepWrap = el('div', 'qty-stepper');
    const minus = el('button', 'step-btn'); minus.textContent = '−';
    const valEl = elTxt('span', qty, 'qty-val');
    const plus = el('button', 'step-btn'); plus.textContent = '+';
    minus.addEventListener('click', () => { if (qty > 1) { qty--; valEl.textContent = qty; } });
    plus.addEventListener('click', () => { qty++; valEl.textContent = qty; });
    stepWrap.append(minus, valEl, plus);
    box.appendChild(stepWrap);

    const actions = el('div', 'qty-box-actions');

    // Confirm + add more
    const confirmMore = btn(t.addMore, 'btn btn-secondary');
    confirmMore.addEventListener('click', () => {
      if (!this._addItem(finalName, prefillCat, qty)) return;
      backdrop.remove();
      this._view = 'add-cats';
      this._render();
    });

    const confirmDone = btn(t.confirm, 'btn btn-primary');
    confirmDone.addEventListener('click', () => {
      if (!this._addItem(finalName, prefillCat, qty)) return;
      backdrop.remove();
      this._view = 'main';
      this._render();
    });

    const cancelBtn = btn(t.cancel, 'btn btn-ghost');
    cancelBtn.style.flex = '0 0 auto';
    cancelBtn.addEventListener('click', () => backdrop.remove());

    actions.append(cancelBtn, confirmMore, confirmDone);
    box.appendChild(actions);
    backdrop.appendChild(box);
    card.appendChild(backdrop);
  }

  _addItem(name, cat, qty) {
    if (!name) return false;
    if (this._nameExists(name)) {
      this._toast(this._t().duplicate);
      return false;
    }
    this._data.items.push({ id: this._nextId(), name, cat: cat || '', qty, bought: false });
    this._save();
    return true;
  }

  /* ── SETTINGS ───────────────────────────────────────────────── */
  _buildSettings() {
    const t = this._t();
    const overlay = el('div', 'overlay');

    const header = el('div', 'overlay-header');
    const closeBtn = iconBtn(ICONS.close, t.close);
    closeBtn.addEventListener('click', () => { this._view = 'main'; this._render(); });
    header.append(elTxt('span', t.settings, 'overlay-title'), closeBtn);
    overlay.appendChild(header);

    const body = el('div', 'overlay-body');

    // Clear bought
    const clearSection = el('div', 'settings-section');
    clearSection.appendChild(elTxt('div', t.boughtItems, 'settings-section-title'));
    const clearBtn = btn(t.clearBought, 'btn btn-danger');
    clearBtn.addEventListener('click', () => {
      if (!confirm(t.confirmDelete)) return;
      this._data.items = this._data.items.filter(i => !i.bought);
      this._save(); this._render();
    });
    clearSection.appendChild(clearBtn);
    body.appendChild(clearSection);

    // Categories
    const catSection = el('div', 'settings-section');
    catSection.appendChild(elTxt('div', t.categories, 'settings-section-title'));
    this._buildCatRows(catSection);
    body.appendChild(catSection);

    // Products
    const prodSection = el('div', 'settings-section');
    prodSection.appendChild(elTxt('div', t.products, 'settings-section-title'));
    this._buildProdRows(prodSection);
    body.appendChild(prodSection);

    overlay.appendChild(body);
    return overlay;
  }

  _buildCatRows(parent) {
    const t = this._t();
    const list = el('div');

    const renderList = () => {
      list.innerHTML = '';
      if (!this._data.categories.length) {
        list.appendChild(elTxt('div', t.noCats, 'settings-row'));
      }
      this._data.categories.forEach(cat => {
        const row = el('div', 'settings-row');
        row.appendChild(elTxt('span', cat, 'settings-row-name'));
        const count = this._data.products.filter(p => p.cat === cat).length;
        row.appendChild(elTxt('span', `${count} prod.`, 'settings-row-sub'));
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

    // Add category row
    const addRow = el('div', 'add-row');
    const catInp = inp('text', t.catName);
    const addBtn = btn('+', 'btn btn-primary');
    addBtn.style.flex = '0 0 44px';
    addBtn.addEventListener('click', () => {
      const v = catInp.value.trim();
      if (!v || this._data.categories.includes(v)) return;
      this._data.categories.push(v);
      this._save(); catInp.value = ''; renderList();
    });
    addRow.append(catInp, addBtn);
    parent.appendChild(addRow);
  }

  _buildProdRows(parent) {
    const t = this._t();
    const list = el('div');

    const renderList = () => {
      list.innerHTML = '';
      if (!this._data.products.length) {
        list.appendChild(elTxt('div', t.noProds, 'settings-row'));
      }
      this._data.products.forEach(prod => {
        const row = el('div', 'settings-row');
        row.appendChild(elTxt('span', prod.name, 'settings-row-name'));
        row.appendChild(elTxt('span', prod.cat, 'settings-row-sub'));
        const del = iconBtn(ICONS.trash, t.delete);
        del.addEventListener('click', () => {
          if (!confirm(t.confirmDelete)) return;
          this._data.products = this._data.products.filter(p => p.name !== prod.name || p.cat !== prod.cat);
          this._save(); renderList();
        });
        row.appendChild(del);
        list.appendChild(row);
      });
    };
    renderList();
    parent.appendChild(list);

    // Add product row
    const addRow = el('div', 'add-row');
    const nameInp = inp('text', t.prodName);
    const catSel = document.createElement('select');
    catSel.style.cssText = 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:8px 12px;font-size:13px;color:var(--primary-text-color,#fff);';
    const renderSel = () => {
      catSel.innerHTML = `<option value="">${t.selectCat}</option>`;
      this._data.categories.forEach(c => {
        const o = document.createElement('option'); o.value = c; o.textContent = c; catSel.appendChild(o);
      });
    };
    renderSel();
    const addBtn = btn('+', 'btn btn-primary');
    addBtn.style.flex = '0 0 44px';
    addBtn.addEventListener('click', () => {
      const name = nameInp.value.trim();
      const cat = catSel.value;
      if (!name || !cat) return;
      if (this._data.products.some(p => p.name.toLowerCase() === name.toLowerCase() && p.cat === cat)) return;
      this._data.products.push({ name, cat });
      this._save(); nameInp.value = ''; renderList(); renderSel();
    });
    addRow.append(nameInp, catSel, addBtn);
    parent.appendChild(addRow);
  }

  /* ── PRINT ──────────────────────────────────────────────────── */
  _print() {
    const t = this._t();
    const pending = this._data.items.filter(i => !i.bought);
    const bought = this._data.items.filter(i => i.bought);

    const buildSection = (title, items) => {
      if (!items.length) return '';
      const rows = items.map(i =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;font-size:14px;">${i.name}</td>
         <td style="padding:6px 0;border-bottom:1px solid #eee;font-size:14px;text-align:right;">${i.qty} ks</td>
         <td style="padding:6px 0;border-bottom:1px solid #eee;width:60px;">☐</td></tr>`
      ).join('');
      return `<h3 style="margin:20px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#888;">${title}</h3>
              <table style="width:100%;border-collapse:collapse;">${rows}</table>`;
    };

    const html = `<!DOCTYPE html><html><head><title>${t.title}</title>
      <style>body{font-family:sans-serif;padding:24px;max-width:480px;margin:auto;}
      h1{font-size:20px;margin-bottom:4px;} p{color:#888;font-size:12px;margin:0 0 16px;}
      @media print{body{padding:0;}}</style></head><body>
      <h1>${t.title}</h1>
      <p>${new Date().toLocaleDateString()}</p>
      ${buildSection(t.pending, pending)}
      ${bought.length ? buildSection(t.boughtItems, bought) : ''}
      <script>window.print();<\/script></body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  }

  /* ── HA card config ─────────────────────────────────────────── */
  static getConfigElement() { return document.createElement('div'); }
  static getStubConfig() { return {}; }
}

customElements.define('shopping-list-card', ShoppingListCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'shopping-list-card',
  name: 'Shopping List',
  description: 'A shopping list card with categories and predefined products.',
});
