# 🛒 Shopping List — Home Assistant

Custom Lovelace karta pre nákupný zoznam v Home Assistant. Inštalovateľná cez HACS bez manuálneho kopírovania súborov.

## Funkcie

- 🛒 Nákupný zoznam s názvom a počtom kusov
- 🔴 / 🟢 Červená = treba kúpiť, zelená = kúpené (kliknutím prepínate)
- 📂 Katalóg kategórií a preddefinovaného tovaru
- 🔍 Filter: Všetky / Na kúpenie / Kúpené
- 🚫 Ochrana pred duplicitami (rovnaký názov nemôžete pridať dvakrát)
- 🖨 Tlač zoznamu na domácej tlačiarni (WiFi)
- 🌍 Podpora SK / EN / CS (podľa jazyka Home Assistant)
- 💾 Dáta v HA `.storage` — zdieľané naprieč zariadeniami, prežijú reštart

## Štruktúra projektu

```
shopping-list-ha/
├── hacs.json
├── README.md
└── custom_components/
    └── shopping_list/
        ├── __init__.py          ← Python backend (Store, REST API, auto-registrácia JS)
        ├── config_flow.py       ← inštalácia cez UI bez konfigurácie
        ├── manifest.json
        ├── strings.json
        └── www/
            └── shopping-list-card.js   ← Lovelace custom karta
```

## Inštalácia cez HACS

1. Otvor **HACS → Integrácie**
2. Klikni **⋮ → Custom repositories**
3. Zadaj URL tvojho GitLab repozitára, kategória: **Integration**
4. Vyhľadaj **Shopping List** a nainštaluj
5. Reštartuj Home Assistant
6. Choď do **Nastavenia → Zariadenia & služby → + Pridať integráciu → Shopping List**
7. Pridaj kartu do dashboardu:

```yaml
type: custom:shopping-list-card
```

> Karta sa zaregistruje automaticky — nie je potrebné pridávať resource manuálne.

## Ukladanie dát

Dáta sú uložené v `/.storage/shopping_list.data` cez HA `Store` API:
- ✅ Dostupné na **všetkých zariadeniach** naraz
- ✅ Zachované po **reštarte** HA
- ✅ Súčasťou **štandardnej HA zálohy**

## Ako používať

### Pridanie položky
1. Kliknite **+** (FAB tlačidlo vpravo dole)
2. Vyberte kategóriu z katalógu, alebo kliknite **Vlastná položka**
3. Nastavte počet kusov
4. Potvrďte — môžete pokračovať pridávaním alebo zatvoriť

### Správa položiek
- **Klik na položku** → popup s možnosťami: označiť kúpené, zmeniť počet, zmazať
- Červená = treba kúpiť, Zelená = kúpené

### Nastavenia (⚙)
- Pridávanie / mazanie **kategórií**
- Pridávanie / mazanie **preddefinovaného tovaru** s priradením pod kategóriu
- Vymazanie všetkých kúpených položiek

### Tlač
- Ikona tlačiarne v hlavičke otvorí okno s formátovaným zoznamom pripraveným na tlač
