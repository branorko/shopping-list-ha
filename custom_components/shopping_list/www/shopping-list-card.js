/* ============================================================
   shopping-list-card.js  —  Home Assistant Lovelace Card
   v1.2.1 — inline +/- in catalog, unit-aware step, unit on product
   ============================================================ */

const API_URL = '/api/shopping_list/data';
const UNITS = ['ks', 'kg', 'l'];

/* ── i18n ──────────────────────────────────────────────────── */
const TRANSLATIONS = {
  sk: {
    title: 'Nákupný zoznam', add: 'Pridať položku', settings: 'Nastavenia',
    delete: 'Zmazať', save: 'Uložiť', cancel: 'Zrušiť', edit: 'Upraviť',
    back: 'Späť', close: 'Zatvoriť', itemName: 'Názov položky',
    markBought: 'Označiť za kúpené', markPending: 'Označiť ako nekúpené',
    confirmDelete: 'Naozaj zmazať?', categories: 'Kategórie',
    products: 'Preddefinovaný tovar', catName: 'Názov kategórie',
    prodName: 'Názov tovaru', prodCat: 'Kategória', selectCat: 'Vyberte kategóriu',
    addFromCatalog: 'Pridať z katalógu', customItem: 'Vlastná položka',
    qtyLabel: 'Množstvo', unit: 'Jednotka', confirm: 'Potvrdiť', addMore: 'Pridať ďalší',
    noItems: 'Zoznam je prázdny. Kliknite + a pridajte položku.',
    noCats: 'Zatiaľ žiadne kategórie.', noProds: 'Zatiaľ žiadne produkty.',
    printList: 'Tlačiť zoznam', allItems: 'Všetky položky',
    pending: 'Na kúpenie', boughtItems: 'Kúpené', clearBought: 'Odstrániť kúpené',
    loading: 'Načítavam…', catOrder: 'Poradie kategórií',
    moveUp: 'Hore', moveDown: 'Dolu', newName: 'Nový názov',
  },
  en: {
    title: 'Shopping List', add: 'Add item', settings: 'Settings',
    delete: 'Delete', save: 'Save', cancel: 'Cancel', edit: 'Edit',
    back: 'Back', close: 'Close', itemName: 'Item name',
    markBought: 'Mark as bought', markPending: 'Mark as not bought',
    confirmDelete: 'Really delete?', categories: 'Categories',
    products: 'Predefined products', catName: 'Category name',
    prodName: 'Product name', prodCat: 'Category', selectCat: 'Select category',
    addFromCatalog: 'Add from catalog', customItem: 'Custom item',
    qtyLabel: 'Quantity', unit: 'Unit', confirm: 'Confirm', addMore: 'Add more',
    noItems: 'List is empty. Click + to add an item.',
    noCats: 'No categories yet.', noProds: 'No products yet.',
    printList: 'Print list', allItems: 'All items',
    pending: 'To buy', boughtItems: 'Bought', clearBought: 'Remove bought',
    loading: 'Loading…', catOrder: 'Category order',
    moveUp: 'Up', moveDown: 'Down', newName: 'New name',
  },
  cs: {
    title: 'Nákupní seznam', add: 'Přidat položku', settings: 'Nastavení',
    delete: 'Smazat', save: 'Uložit', cancel: 'Zrušit', edit: 'Upravit',
    back: 'Zpět', close: 'Zavřít', itemName: 'Název položky',
    markBought: 'Označit jako koupené', markPending: 'Označit jako nekoupené',
    confirmDelete: 'Opravdu smazat?', categories: 'Kategorie',
    products: 'Předdefinované zboží', catName: 'Název kategorie',
    prodName: 'Název zboží', prodCat: 'Kategorie', selectCat: 'Vyberte kategorii',
    addFromCatalog: 'Přidat z katalogu', customItem: 'Vlastní položka',
    qtyLabel: 'Množství', unit: 'Jednotka', confirm: 'Potvrdit', addMore: 'Přidat další',
    noItems: 'Seznam je prázdný. Klikněte + a přidejte položku.',
    noCats: 'Zatím žádné kategorie.', noProds: 'Zatím žádné produkty.',
    printList: 'Tisknout seznam', allItems: 'Všechny položky',
    pending: 'K nákupu', boughtItems: 'Koupeno', clearBought: 'Odebrat koupené',
    loading: 'Načítám…', catOrder: 'Pořadí kategorií',
    moveUp: 'Nahoru', moveDown: 'Dolů', newName: 'Nový název',
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
  plusSm: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  print: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  back: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
  close: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  up: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>`,
  down: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
};

/* ── Custom dropdown (replaces <select>) ─────────────────────
   Returns { wrap, getValue, setValue, onChange }              */
function makeDropdown(options, initialValue, placeholder = '—') {
  // options = [{value, label}]
  let currentValue = initialValue;
  let onChangeCb = null;

  const wrap = el('div', 'sl-dd-wrap');
  const trigger = el('div', 'sl-dd-trigger');
  const triggerLabel = el('span', 'sl-dd-label');
  const arrow = el('span', 'sl-dd-arrow'); arrow.textContent = '▾';
  trigger.append(triggerLabel, arrow);
  wrap.appendChild(trigger);

  const menu = el('div', 'sl-dd-menu');
  wrap.appendChild(menu);

  const setLabel = (val) => {
    const found = options.find(o => o.value === val);
    triggerLabel.textContent = found ? found.label : placeholder;
    triggerLabel.style.color = found ? '#fff' : 'rgba(255,255,255,0.4)';
  };

  const buildMenu = () => {
    menu.innerHTML = '';
    options.forEach(opt => {
      const item = el('div', 'sl-dd-item' + (opt.value === currentValue ? ' sl-dd-item-active' : ''));
      item.textContent = opt.label;
      if (opt.value === currentValue) item.innerHTML += ' ' + ICONS.check;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        currentValue = opt.value;
        setLabel(currentValue);
        buildMenu();
        menu.classList.remove('sl-dd-open');
        wrap.classList.remove('sl-dd-active');
        if (onChangeCb) onChangeCb(currentValue);
      });
      menu.appendChild(item);
    });
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.toggle('sl-dd-open');
    wrap.classList.toggle('sl-dd-active', isOpen);
    // close other open dropdowns
    document.querySelectorAll('.sl-dd-menu.sl-dd-open').forEach(m => {
      if (m !== menu) { m.classList.remove('sl-dd-open'); m.closest('.sl-dd-wrap')?.classList.remove('sl-dd-active'); }
    });
  });

  document.addEventListener('click', () => {
    menu.classList.remove('sl-dd-open');
    wrap.classList.remove('sl-dd-active');
  }, { capture: true, passive: true });

  setLabel(currentValue);
  buildMenu();

  return {
    wrap,
    getValue: () => currentValue,
    setValue: (v) => { currentValue = v; setLabel(v); buildMenu(); },
    onChange: (cb) => { onChangeCb = cb; },
  };
}

/* ── Modal styles injected into document.head ───────────────── */
const MODAL_STYLES = `
.sl-modal-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.82);
  display: flex; flex-direction: column;
  animation: slFadeIn .18s ease;
  font-family: var(--primary-font-family, Roboto, sans-serif);
}
@keyframes slFadeIn { from{opacity:0} to{opacity:1} }

.sl-modal {
  background: #1c1c1e; display: flex; flex-direction: column;
  flex: 1; overflow: hidden;
  max-width: 640px; width: 100%; margin: 0 auto;
  animation: slSlideUp .2s ease;
}
@keyframes slSlideUp { from{transform:translateY(24px);opacity:0} to{transform:none;opacity:1} }

.sl-modal-header {
  display: flex; align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  gap: 8px; flex-shrink: 0;
}
.sl-modal-title { flex: 1; font-size: 16px; font-weight: 600; color: #fff; }
.sl-modal-body { flex: 1; overflow-y: auto; padding: 16px; }

.sl-sheet-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.65);
  display: flex; align-items: flex-end;
  animation: slFadeIn .15s ease;
  font-family: var(--primary-font-family, Roboto, sans-serif);
}
.sl-sheet {
  background: #242428; border-radius: 20px 20px 0 0;
  padding: 20px; width: 100%;
  display: flex; flex-direction: column; gap: 14px;
  box-shadow: 0 -12px 40px rgba(0,0,0,0.6);
  animation: slSheetUp .2s ease;
  max-height: 90vh; overflow-y: auto;
  max-width: 640px; margin: 0 auto;
}
@keyframes slSheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }

/* icons + buttons */
.sl-icon-btn {
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.5); padding: 7px; border-radius: 8px;
  display: flex; align-items: center; transition: background .15s, color .15s;
}
.sl-icon-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
.sl-icon-btn svg { display: block; }

.sl-btn {
  border: none; border-radius: 10px; padding: 11px 18px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: opacity .12s, transform .1s; flex: 1; font-family: inherit;
}
.sl-btn:active { transform: scale(0.97); }
.sl-btn-primary { background: var(--primary-color, #03a9f4); color: #fff; }
.sl-btn-secondary { background: rgba(255,255,255,0.1); color: #fff; }
.sl-btn-danger { background: rgba(239,68,68,0.15); color: #ef4444; }
.sl-btn-ghost { background: none; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); }

/* qty stepper */
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
  gap: 12px; flex-wrap: wrap;
}
.sl-detail-label { font-size: 13px; color: rgba(255,255,255,0.5); flex-shrink: 0; }
.sl-stepper-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }

.sl-actions { display: flex; gap: 8px; flex-wrap: wrap; }

/* catalog grid */
.sl-cat-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(130px,1fr));
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

/* text inputs */
.sl-name-inp {
  width: 100%; background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px; padding: 11px 14px;
  font-size: 15px; color: #fff; outline: none;
  font-family: inherit; transition: border-color .15s;
}
.sl-name-inp:focus { border-color: var(--primary-color, #03a9f4); }
.sl-text-inp {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px; padding: 8px 12px;
  font-size: 13px; color: #fff; outline: none; font-family: inherit;
  flex: 1;
}
.sl-text-inp:focus { border-color: var(--primary-color, #03a9f4); }

/* settings rows */
.sl-section { margin-bottom: 24px; }
.sl-section-title {
  font-size: 11px; font-weight: 600; letter-spacing: 0.8px;
  text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 10px;
}
.sl-row {
  display: flex; align-items: center; padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06); gap: 6px;
}
.sl-row-name { flex: 1; font-size: 14px; color: #fff; }
.sl-row-sub { font-size: 11px; color: rgba(255,255,255,0.4); margin-right: 2px; }
.sl-add-row { display: flex; gap: 8px; margin-top: 10px; align-items: center; }
.sl-empty { text-align: center; padding: 20px; color: rgba(255,255,255,0.4); font-size: 13px; }
.sl-custom-row { margin-bottom: 16px; }

/* inline edit row */
.sl-edit-row {
  display: flex; gap: 6px; align-items: center;
  padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
}

/* ── Custom Dropdown ── */
.sl-dd-wrap { position: relative; flex: 1; }
.sl-dd-trigger {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px; padding: 8px 12px;
  cursor: pointer; font-size: 13px; color: #fff;
  transition: border-color .15s;
  user-select: none; gap: 6px;
}
.sl-dd-trigger:hover, .sl-dd-active .sl-dd-trigger { border-color: var(--primary-color, #03a9f4); }
.sl-dd-label { flex: 1; }
.sl-dd-arrow { font-size: 10px; color: rgba(255,255,255,0.4); transition: transform .15s; flex-shrink: 0; }
.sl-dd-active .sl-dd-arrow { transform: rotate(180deg); }
.sl-dd-menu {
  display: none; position: absolute; left: 0; right: 0; top: calc(100% + 4px);
  background: #2c2c30; border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px; z-index: 100; overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}
.sl-dd-menu.sl-dd-open { display: block; animation: slFadeIn .12s ease; }
.sl-dd-item {
  padding: 10px 14px; font-size: 13px; color: rgba(255,255,255,0.85);
  cursor: pointer; display: flex; align-items: center; justify-content: space-between;
  transition: background .1s;
}
.sl-dd-item:hover { background: rgba(255,255,255,0.08); }
.sl-dd-item-active { color: #fff; font-weight: 600; }
.sl-dd-item svg { opacity: 0.7; flex-shrink: 0; }

/* inline catalog stepper */
.sl-prod-stepper {
  display: flex; align-items: center; gap: 0; flex-shrink: 0;
}
.sl-inline-step {
  width: 30px; height: 30px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.07); color: #fff;
  font-size: 18px; cursor: pointer; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  transition: background .12s; flex-shrink: 0; padding: 0;
  font-family: inherit;
}
.sl-inline-step:hover { background: rgba(255,255,255,0.16); }
.sl-inline-qty {
  font-size: 14px; font-weight: 700; color: #fff;
  min-width: 36px; text-align: center;
}
.sl-inline-qty.zero { color: rgba(255,255,255,0.25); }

/* unit toggle (3 buttons) */
.sl-unit-group { display: flex; gap: 6px; }
.sl-unit-btn {
  flex: 1; border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6);
  border-radius: 8px; padding: 7px 4px; font-size: 13px;
  cursor: pointer; font-family: inherit; transition: all .12s;
  text-align: center;
}
.sl-unit-btn.active {
  background: var(--primary-color, #03a9f4);
  border-color: transparent; color: #fff; font-weight: 600;
}
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
    background: var(--ha-card-background, var(--card-background-color,#1c1c1e));
    border-radius: var(--ha-card-border-radius,12px);
    overflow: hidden; min-height: 120px; position: relative;
  }
  .header {
    display: flex; align-items: center; padding: 14px 16px 10px;
    border-bottom: 1px solid var(--divider-color,rgba(255,255,255,0.08)); gap: 8px;
  }
  .header-title { flex:1; font-size:15px; font-weight:600; letter-spacing:.3px; color:var(--primary-text-color,#fff); }
  .sl-icon-btn {
    background:none; border:none; cursor:pointer;
    color:var(--secondary-text-color,rgba(255,255,255,0.5));
    padding:6px; border-radius:8px; display:flex; align-items:center;
    transition:background .15s,color .15s;
  }
  .sl-icon-btn:hover { background:rgba(255,255,255,0.07); color:var(--primary-text-color,#fff); }
  .filter-tabs { display:flex; padding:8px 16px 0; gap:6px; }
  .tab {
    background:none; border:1px solid var(--divider-color,rgba(255,255,255,0.12));
    border-radius:20px; padding:4px 12px; font-size:12px; cursor:pointer;
    color:var(--secondary-text-color,rgba(255,255,255,0.55)); transition:all .15s;
  }
  .tab.active { background:var(--primary-color,#03a9f4); border-color:transparent; color:#fff; font-weight:500; }
  .items-wrap { padding:8px 0 80px; }
  .cat-header {
    padding: 10px 16px 4px; font-size:11px; font-weight:600;
    letter-spacing:.8px; text-transform:uppercase;
    color:var(--secondary-text-color,rgba(255,255,255,0.4));
  }
  .empty-msg { text-align:center; padding:32px 20px; color:var(--secondary-text-color,rgba(255,255,255,0.4)); font-size:13px; }
  .item {
    display:flex; align-items:center; padding:11px 16px;
    border-bottom:1px solid var(--divider-color,rgba(255,255,255,0.06));
    cursor:pointer; transition:background .12s; gap:10px;
  }
  .item:hover { background:rgba(255,255,255,0.03); }
  .item-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .item.pending .item-dot { background:#ef4444; }
  .item.bought .item-dot { background:#22c55e; }
  .item-name { flex:1; font-size:14px; color:var(--primary-text-color,#fff); font-weight:500; }
  .item.bought .item-name { text-decoration:line-through; color:var(--secondary-text-color,rgba(255,255,255,0.4)); }
  .item-qty { font-size:12px; padding:2px 8px; border-radius:10px; min-width:28px; text-align:center; white-space:nowrap; }
  .item.bought .item-qty { background:rgba(34,197,94,0.12); color:#22c55e; }
  .item.pending .item-qty { background:rgba(239,68,68,0.12); color:#ef4444; }
  .fab {
    position:absolute; bottom:16px; right:16px;
    width:48px; height:48px; border-radius:50%;
    background:var(--primary-color,#03a9f4); border:none; cursor:pointer;
    color:#fff; display:flex; align-items:center; justify-content:center;
    box-shadow:0 4px 16px rgba(0,0,0,0.4); transition:transform .12s,box-shadow .12s;
  }
  .fab:hover { transform:scale(1.08); box-shadow:0 6px 20px rgba(0,0,0,0.5); }
  .fab:active { transform:scale(0.95); }
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
        this._data = {
          items: d.items || [],
          categories: d.categories || [],
          products: d.products || [],
        };
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

  /* ── Sort items by category order ── */
  _sortedItems(items) {
    const cats = this._data.categories; // ordered array
    return [...items].sort((a, b) => {
      const ai = cats.indexOf(a.cat);
      const bi = cats.indexOf(b.cat);
      const ac = ai === -1 ? 999 : ai;
      const bc = bi === -1 ? 999 : bi;
      if (ac !== bc) return ac - bc;
      return a.name.localeCompare(b.name);
    });
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
      root.appendChild(card); return;
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

    // Sort: bought always last, within same state sort by category order
    const pending = this._sortedItems(items.filter(i => !i.bought));
    const bought  = this._sortedItems(items.filter(i => i.bought));
    const sorted  = [...pending, ...bought];

    // Group by category with headers
    let lastCat = null;
    sorted.forEach(item => {
      const catLabel = item.cat || '';
      if (catLabel !== lastCat) {
        lastCat = catLabel;
        if (catLabel) wrap.appendChild(elTxt('div', catLabel, 'cat-header'));
      }
      const row = el('div', 'item ' + (item.bought ? 'bought' : 'pending'));
      row.appendChild(el('span', 'item-dot'));
      row.appendChild(elTxt('span', item.name, 'item-name'));
      const unit = item.unit || 'ks';
      row.appendChild(elTxt('span', `${item.qty} ${unit}`, 'item-qty'));
      row.addEventListener('click', () => this._openDetail(item));
      wrap.appendChild(row);
    });
    return wrap;
  }

  _buildFab() {
    const f = el('button', 'fab');
    f.innerHTML = ICONS.plus; f.title = this._t().add;
    f.addEventListener('click', () => this._openAddCats());
    return f;
  }

  /* ════════════════════════════════════════════════════════
     MODAL helpers
     ════════════════════════════════════════════════════════ */
  _makeFullModal(title, onBack, onClose) {
    const bd = document.createElement('div');
    bd.className = 'sl-modal-backdrop';
    document.body.appendChild(bd);
    const modal = el('div', 'sl-modal');
    const header = el('div', 'sl-modal-header');
    if (onBack) {
      const b = iconBtn(ICONS.back, this._t().back);
      b.addEventListener('click', () => { bd.remove(); onBack(); });
      header.appendChild(b);
    }
    header.appendChild(elTxt('span', title, 'sl-modal-title'));
    const closeBtn = iconBtn(ICONS.close, this._t().close);
    closeBtn.addEventListener('click', () => { bd.remove(); if (onClose) onClose(); });
    header.appendChild(closeBtn);
    const body = el('div', 'sl-modal-body');
    modal.append(header, body);
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

  /* ── Unit toggle widget ── */
  _makeUnitToggle(currentUnit) {
    const group = el('div', 'sl-unit-group');
    let selected = currentUnit || 'ks';
    const btns = {};
    UNITS.forEach(u => {
      const b = el('button', 'sl-unit-btn' + (u === selected ? ' active' : ''));
      b.textContent = u; b.type = 'button';
      b.addEventListener('click', () => {
        selected = u;
        Object.values(btns).forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      });
      btns[u] = b;
      group.appendChild(b);
    });
    return { group, getUnit: () => selected };
  }

  /* ── Detail bottom sheet ── */
  _openDetail(item) {
    const t = this._t();
    // Check if this item comes from the predefined product catalog
    const prod = this._data.products.find(p => p.name.toLowerCase() === item.name.toLowerCase());
    const isPredefined = !!prod;
    const itemUnit = item.unit || 'ks';
    const step = (itemUnit === 'kg' || itemUnit === 'l') ? 0.1 : 1;
    const fmt = (v) => (itemUnit === 'kg' || itemUnit === 'l') ? v.toFixed(1) : String(v);

    const { bd, sheet } = this._makeSheet();
    sheet.appendChild(elTxt('div', item.name, 'sl-detail-title'));

    // Stepper + unit (unit toggle only for non-predefined items)
    const stepperWrap = el('div', 'sl-detail-stepper');
    stepperWrap.appendChild(elTxt('span', t.qtyLabel, 'sl-detail-label'));
    const right = el('div', 'sl-stepper-right');
    const stepper = el('div', 'sl-stepper');
    const minus = el('button', 'sl-step-btn'); minus.textContent = '−';
    const valEl = elTxt('span', fmt(item.qty), 'sl-qty-val');
    const plus = el('button', 'sl-step-btn'); plus.textContent = '+';
    minus.addEventListener('click', () => {
      if (item.qty > step) {
        item.qty = Math.round((item.qty - step) * 10) / 10;
        valEl.textContent = fmt(item.qty);
      }
    });
    plus.addEventListener('click', () => {
      item.qty = Math.round((item.qty + step) * 10) / 10;
      valEl.textContent = fmt(item.qty);
    });
    stepper.append(minus, valEl, plus);
    right.appendChild(stepper);

    let getUnit;
    if (isPredefined) {
      // Show unit as static label, not editable
      const unitLabel = elTxt('span', itemUnit);
      unitLabel.style.cssText = 'font-size:15px;font-weight:600;color:rgba(255,255,255,0.5);padding:0 6px;';
      right.appendChild(unitLabel);
      getUnit = () => itemUnit;
    } else {
      const { group: unitGroup, getUnit: _getUnit } = this._makeUnitToggle(itemUnit);
      right.appendChild(unitGroup);
      getUnit = _getUnit;
    }

    stepperWrap.appendChild(right);
    sheet.appendChild(stepperWrap);

    const actions = el('div', 'sl-actions');
    const toggleBtn = btn(item.bought ? t.markPending : t.markBought, 'sl-btn sl-btn-primary');
    toggleBtn.addEventListener('click', () => {
      item.bought = !item.bought; item.unit = getUnit();
      this._save(); bd.remove(); this._render();
    });
    const saveBtn = btn(t.save, 'sl-btn sl-btn-secondary');
    saveBtn.addEventListener('click', () => {
      item.unit = getUnit(); this._save(); bd.remove(); this._render();
    });
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

  /* ── ADD: products in category — inline +/- stepper ── */
  _openAddProds(cat) {
    const t = this._t();
    const { bd, body } = this._makeFullModal(cat, () => this._openAddCats(), null);
    const prods = this._data.products.filter(p => p.cat === cat);

    if (!prods.length) {
      body.appendChild(elTxt('p', t.noProds, 'sl-empty'));
    } else {
      prods.forEach(prod => {
        const unit = prod.unit || 'ks';
        const step = (unit === 'kg' || unit === 'l') ? 0.1 : 1;
        const fmt = (v) => (unit === 'kg' || unit === 'l') ? v.toFixed(1) : String(v);

        // Current quantity in the list
        const existing = this._data.items.find(i => i.name.toLowerCase() === prod.name.toLowerCase());
        let qty = existing ? existing.qty : 0;

        const row = el('div', 'sl-prod-item');
        row.appendChild(elTxt('span', prod.name, 'sl-prod-name'));

        // Unit label
        const unitLabel = elTxt('span', unit);
        unitLabel.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.35);margin-right:4px;flex-shrink:0;';
        row.appendChild(unitLabel);

        // Inline stepper
        const stepperWrap = el('div', 'sl-prod-stepper');

        const minusBtn = el('button', 'sl-inline-step');
        minusBtn.textContent = '−'; minusBtn.type = 'button';

        const qtyEl = elTxt('span', qty > 0 ? fmt(qty) : '—', 'sl-inline-qty' + (qty === 0 ? ' zero' : ''));

        const plusBtn = el('button', 'sl-inline-step');
        plusBtn.textContent = '+'; plusBtn.type = 'button';

        const updateQty = (newQty) => {
          qty = Math.max(0, Math.round(newQty * 10) / 10);
          qtyEl.textContent = qty > 0 ? fmt(qty) : '—';
          qtyEl.className = 'sl-inline-qty' + (qty === 0 ? ' zero' : '');
          if (qty > 0) {
            this._addItem(prod.name, cat, qty, unit);
          } else {
            // Remove item if qty goes to 0
            this._data.items = this._data.items.filter(
              i => i.name.toLowerCase() !== prod.name.toLowerCase()
            );
            this._save(); this._render();
          }
        };

        minusBtn.addEventListener('click', (e) => { e.stopPropagation(); updateQty(qty - step); });
        plusBtn.addEventListener('click',  (e) => { e.stopPropagation(); updateQty(qty + step); });

        stepperWrap.append(minusBtn, qtyEl, plusBtn);
        row.appendChild(stepperWrap);
        body.appendChild(row);
      });
    }

    const quickBtn = el('button', 'sl-quick-add-btn');
    quickBtn.innerHTML = ICONS.plus + `<span>${t.customItem}</span>`;
    quickBtn.addEventListener('click', () => { bd.remove(); this._openQtyPopup(null, cat); });
    body.appendChild(quickBtn);
  }

  /* ── ADD: qty + unit bottom sheet (custom / free-text items) ── */
  _openQtyPopup(prefillName, prefillCat) {
    const t = this._t();
    const existingItem = prefillName
      ? this._data.items.find(i => i.name.toLowerCase() === prefillName.toLowerCase())
      : null;
    const prod = prefillName
      ? this._data.products.find(p => p.name.toLowerCase() === prefillName.toLowerCase())
      : null;
    const prodUnit = prod?.unit || existingItem?.unit || 'ks';
    const step = (prodUnit === 'kg' || prodUnit === 'l') ? 0.1 : 1;
    const fmt = (v) => (prodUnit === 'kg' || prodUnit === 'l') ? v.toFixed(1) : String(v);
    let qty = existingItem ? existingItem.qty : (step === 1 ? 1 : step);
    let finalName = prefillName || '';
    const { bd, sheet } = this._makeSheet();

    if (!prefillName) {
      const nameInp = document.createElement('input');
      nameInp.className = 'sl-name-inp'; nameInp.type = 'text';
      nameInp.placeholder = t.itemName;
      nameInp.addEventListener('input', () => { finalName = nameInp.value.trim(); });
      sheet.appendChild(nameInp);
      setTimeout(() => nameInp.focus(), 80);
    } else {
      sheet.appendChild(elTxt('div', prefillName, 'sl-detail-title'));
    }

    // Stepper + unit
    const stepperWrap = el('div', 'sl-detail-stepper');
    stepperWrap.appendChild(elTxt('span', t.qtyLabel, 'sl-detail-label'));
    const right = el('div', 'sl-stepper-right');
    const stepper = el('div', 'sl-stepper');
    const minus = el('button', 'sl-step-btn'); minus.textContent = '−';
    const valEl = elTxt('span', fmt(qty), 'sl-qty-val');
    const plus = el('button', 'sl-step-btn'); plus.textContent = '+';
    minus.addEventListener('click', () => { if (qty > step) { qty = Math.round((qty - step) * 10) / 10; valEl.textContent = fmt(qty); } });
    plus.addEventListener('click', () => { qty = Math.round((qty + step) * 10) / 10; valEl.textContent = fmt(qty); });
    stepper.append(minus, valEl, plus);
    const { group: unitGroup, getUnit } = this._makeUnitToggle(prodUnit);
    right.append(stepper, unitGroup);
    stepperWrap.appendChild(right);
    sheet.appendChild(stepperWrap);

    const actions = el('div', 'sl-actions');
    const addMore = btn(t.addMore, 'sl-btn sl-btn-secondary');
    addMore.addEventListener('click', () => {
      if (!this._addItem(finalName, prefillCat, qty, getUnit())) return;
      bd.remove(); this._openAddCats();
    });
    const confirm_ = btn(t.confirm, 'sl-btn sl-btn-primary');
    confirm_.addEventListener('click', () => {
      if (!this._addItem(finalName, prefillCat, qty, getUnit())) return;
      bd.remove();
    });
    const cancelBtn = btn(t.cancel, 'sl-btn sl-btn-ghost');
    cancelBtn.style.flex = '0 0 auto';
    cancelBtn.addEventListener('click', () => bd.remove());
    actions.append(cancelBtn, addMore, confirm_);
    sheet.appendChild(actions);
  }

  _addItem(name, cat, qty, unit) {
    if (!name) return false;
    const existing = this._data.items.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.qty = qty; existing.unit = unit || 'ks'; existing.bought = false;
    } else {
      this._data.items.push({ id: this._nextId(), name, cat: cat || '', qty, unit: unit || 'ks', bought: false });
    }
    this._save(); this._render();
    return true;
  }

  /* ── SETTINGS ── */
  _openSettings() {
    const t = this._t();
    const { body } = this._makeFullModal(t.settings, null, null);

    // Clear bought
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

    // Categories + ordering
    const sec1 = el('div', 'sl-section');
    sec1.appendChild(elTxt('div', t.categories, 'sl-section-title'));
    this._buildCatRows(sec1);
    body.appendChild(sec1);

    // Products
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
      if (!this._data.categories.length) {
        list.appendChild(elTxt('div', t.noCats, 'sl-empty')); return;
      }
      this._data.categories.forEach((cat, idx) => {
        // Normal display row
        const row = el('div', 'sl-row');

        // Up / Down
        const upBtn = iconBtn(ICONS.up, t.moveUp);
        upBtn.disabled = idx === 0;
        upBtn.style.opacity = idx === 0 ? '0.3' : '1';
        upBtn.addEventListener('click', () => {
          if (idx === 0) return;
          [this._data.categories[idx - 1], this._data.categories[idx]] =
            [this._data.categories[idx], this._data.categories[idx - 1]];
          this._save(); renderList();
        });

        const downBtn = iconBtn(ICONS.down, t.moveDown);
        downBtn.disabled = idx === this._data.categories.length - 1;
        downBtn.style.opacity = downBtn.disabled ? '0.3' : '1';
        downBtn.addEventListener('click', () => {
          if (idx >= this._data.categories.length - 1) return;
          [this._data.categories[idx], this._data.categories[idx + 1]] =
            [this._data.categories[idx + 1], this._data.categories[idx]];
          this._save(); renderList();
        });

        row.appendChild(upBtn);
        row.appendChild(downBtn);

        // Name (click to edit)
        const nameSpan = elTxt('span', cat, 'sl-row-name');
        row.appendChild(nameSpan);

        const count = this._data.products.filter(p => p.cat === cat).length;
        row.appendChild(elTxt('span', `${count}p`, 'sl-row-sub'));

        // Edit
        const editBtn = iconBtn(ICONS.edit, t.edit);
        editBtn.addEventListener('click', () => {
          // Replace row with edit row
          const editRow = el('div', 'sl-edit-row');
          const nameInp = document.createElement('input');
          nameInp.className = 'sl-text-inp'; nameInp.value = cat;
          const saveBtn2 = iconBtn(ICONS.check, t.save);
          saveBtn2.style.color = '#22c55e';
          saveBtn2.addEventListener('click', () => {
            const newVal = nameInp.value.trim();
            if (!newVal || (newVal !== cat && this._data.categories.includes(newVal))) return;
            // Update category name in products and items too
            this._data.products.forEach(p => { if (p.cat === cat) p.cat = newVal; });
            this._data.items.forEach(i => { if (i.cat === cat) i.cat = newVal; });
            this._data.categories[idx] = newVal;
            this._save(); renderList();
          });
          nameInp.addEventListener('keydown', e => { if (e.key === 'Enter') saveBtn2.click(); if (e.key === 'Escape') renderList(); });
          editRow.append(nameInp, saveBtn2);
          list.replaceChild(editRow, row);
          nameInp.focus(); nameInp.select();
        });
        row.appendChild(editBtn);

        // Delete
        const delBtn = iconBtn(ICONS.trash, t.delete);
        delBtn.addEventListener('click', () => {
          if (!confirm(t.confirmDelete)) return;
          this._data.categories.splice(idx, 1);
          this._data.products = this._data.products.filter(p => p.cat !== cat);
          this._save(); renderList();
        });
        row.appendChild(delBtn);
        list.appendChild(row);
      });
    };

    renderList();
    parent.appendChild(list);

    // Add category
    const addRow = el('div', 'sl-add-row');
    const catInp = document.createElement('input');
    catInp.className = 'sl-text-inp'; catInp.placeholder = t.catName;
    const addBtn = btn('+', 'sl-btn sl-btn-primary');
    addBtn.style.cssText = 'flex:0 0 44px;padding:8px;';
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
      if (!this._data.products.length) { list.appendChild(elTxt('div', t.noProds, 'sl-empty')); return; }
      const catOrder = this._data.categories;
      const sorted = [...this._data.products].sort((a, b) => {
        const ai = catOrder.indexOf(a.cat), bi = catOrder.indexOf(b.cat);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi) || a.name.localeCompare(b.name);
      });

      sorted.forEach(prod => {
        const row = el('div', 'sl-row');
        row.appendChild(elTxt('span', prod.name, 'sl-row-name'));
        const meta = el('span', 'sl-row-sub');
        meta.textContent = `${prod.cat} · ${prod.unit || 'ks'}`;
        row.appendChild(meta);

        // Edit
        const editBtn = iconBtn(ICONS.edit, t.edit);
        editBtn.addEventListener('click', () => {
          const editRow = el('div', 'sl-edit-row');
          editRow.style.flexWrap = 'wrap';

          const nameInp = document.createElement('input');
          nameInp.className = 'sl-text-inp'; nameInp.value = prod.name;
          nameInp.style.minWidth = '80px';

          const catOpts = this._data.categories.map(c => ({ value: c, label: c }));
          const catDD = makeDropdown(catOpts, prod.cat, t.selectCat);
          catDD.wrap.style.maxWidth = '120px';

          const { group: unitGroup, getUnit } = this._makeUnitToggle(prod.unit || 'ks');
          unitGroup.style.flexShrink = '0';

          const saveBtn2 = iconBtn(ICONS.check, t.save);
          saveBtn2.style.color = '#22c55e';
          saveBtn2.addEventListener('click', () => {
            const newName = nameInp.value.trim();
            const newCat = catDD.getValue();
            if (!newName || !newCat) return;
            prod.name = newName; prod.cat = newCat; prod.unit = getUnit();
            this._save(); renderList();
          });
          nameInp.addEventListener('keydown', e => { if (e.key === 'Enter') saveBtn2.click(); if (e.key === 'Escape') renderList(); });
          editRow.append(nameInp, catDD.wrap, unitGroup, saveBtn2);
          list.replaceChild(editRow, row);
          nameInp.focus(); nameInp.select();
        });
        row.appendChild(editBtn);

        // Delete
        const delBtn = iconBtn(ICONS.trash, t.delete);
        delBtn.addEventListener('click', () => {
          if (!confirm(t.confirmDelete)) return;
          this._data.products.splice(this._data.products.indexOf(prod), 1);
          this._save(); renderList();
        });
        row.appendChild(delBtn);
        list.appendChild(row);
      });
    };

    renderList();
    parent.appendChild(list);

    // Add product row — name + category + unit
    const addRow = el('div', 'sl-add-row');
    addRow.style.flexWrap = 'wrap';

    const nameInp = document.createElement('input');
    nameInp.className = 'sl-text-inp'; nameInp.placeholder = t.prodName;
    nameInp.style.minWidth = '80px';

    const catOpts = () => this._data.categories.map(c => ({ value: c, label: c }));
    const catDD = makeDropdown(catOpts(), '', t.selectCat);
    catDD.wrap.style.maxWidth = '130px';

    // Unit selector for new product
    let newProdUnit = 'ks';
    const unitGroup2 = el('div', 'sl-unit-group');
    unitGroup2.style.flexShrink = '0';
    UNITS.forEach(u => {
      const b = el('button', 'sl-unit-btn' + (u === newProdUnit ? ' active' : ''));
      b.textContent = u; b.type = 'button';
      b.addEventListener('click', () => {
        newProdUnit = u;
        unitGroup2.querySelectorAll('.sl-unit-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      });
      unitGroup2.appendChild(b);
    });

    const addBtn = btn('+', 'sl-btn sl-btn-primary');
    addBtn.style.cssText = 'flex:0 0 44px;padding:8px;';
    addBtn.addEventListener('click', () => {
      const name = nameInp.value.trim(); const cat = catDD.getValue();
      if (!name || !cat) return;
      if (this._data.products.some(p => p.name.toLowerCase() === name.toLowerCase() && p.cat === cat)) return;
      this._data.products.push({ name, cat, unit: newProdUnit });
      this._save(); nameInp.value = ''; catDD.setValue(''); renderList();
    });
    nameInp.addEventListener('keydown', e => { if (e.key === 'Enter') addBtn.click(); });
    addRow.append(nameInp, catDD.wrap, unitGroup2, addBtn);
    parent.appendChild(addRow);
  }

  /* ── Print ── */
  _print() {
    const t = this._t();
    const pending = this._sortedItems(this._data.items.filter(i => !i.bought));
    const bought  = this._sortedItems(this._data.items.filter(i => i.bought));
    const allItems = [...pending, ...bought];
    if (!allItems.length) return;

    // Build flat list of renderable entries (cat headers + items)
    const buildEntries = (items) => {
      const entries = [];
      let lastCat = null;
      items.forEach(i => {
        if (i.cat !== lastCat) {
          lastCat = i.cat;
          if (i.cat) entries.push({ type: 'cat', label: i.cat });
        }
        entries.push({ type: 'item', data: i });
      });
      return entries;
    };

    const pendingEntries = buildEntries(pending);
    const boughtEntries  = bought.length ? [{ type: 'cat', label: `— ${t.boughtItems} —` }, ...buildEntries(bought)] : [];
    const entries = [...pendingEntries, ...boughtEntries];

    // Distribute entries into 3 columns (top-to-bottom fill)
    const colCount = 3;
    const perCol = Math.ceil(entries.length / colCount);
    const cols = [[], [], []];
    entries.forEach((e, i) => cols[Math.floor(i / perCol)].push(e));

    const renderCol = (col) => col.map(e => {
      if (e.type === 'cat') {
        return `<div class="cat-hdr">${e.label}</div>`;
      }
      const { name, qty, unit } = e.data;
      return `<div class="row"><span class="name">${name}</span><span class="qty">${qty} ${unit || 'ks'}</span><span class="chk">☐</span></div>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><title>${t.title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #000; }
  .page { padding: 10mm 8mm 8mm; }
  .page-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 6mm; border-bottom: 1.5px solid #000; padding-bottom: 3px; }
  .page-header h1 { font-size: 15px; font-weight: 700; }
  .page-header .date { font-size: 10px; color: #666; }
  .columns { display: flex; gap: 0; align-items: flex-start; }
  .col { flex: 1; padding: 0 5px; border-right: 1px solid #ddd; }
  .col:first-child { padding-left: 0; }
  .col:last-child { border-right: none; padding-right: 0; }
  .cat-hdr {
    font-size: 8.5px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; color: #555;
    padding: 5px 0 2px; margin-top: 3px;
    border-top: 1px solid #ccc;
  }
  .col > .cat-hdr:first-child { border-top: none; margin-top: 0; }
  .row { display: flex; align-items: baseline; gap: 3px; padding: 2px 0; border-bottom: 0.5px solid #ebebeb; }
  .name { flex: 1; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .qty { font-size: 10px; color: #333; white-space: nowrap; flex-shrink: 0; }
  .chk { font-size: 12px; margin-left: 3px; flex-shrink: 0; }
  @media print { @page { size: A4; margin: 0; } body { -webkit-print-color-adjust: exact; } }
</style></head><body>
<div class="page">
  <div class="page-header">
    <h1>${t.title}</h1>
    <span class="date">${new Date().toLocaleDateString()}</span>
  </div>
  <div class="columns">
    ${cols.map(col => `<div class="col">${renderCol(col)}</div>`).join('')}
  </div>
</div>
<script>window.print();<\/script>
</body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  }

  static getConfigElement() { return document.createElement('div'); }
  static getStubConfig() { return {}; }
}

customElements.define('shopping-list-card', ShoppingListCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'shopping-list-card', name: 'Shopping List', description: 'Shopping list with categories, units and ordering.' });
