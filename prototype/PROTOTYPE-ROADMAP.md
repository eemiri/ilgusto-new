# Prototype Roadmap — Il Gusto Single-Page

**Created:** 2026-06-01
**Method:** WDS Phase 5 — [P] Prototyping
**Builder:** EVis + Implementation Partner (Freya)

---

## Overview

Eine responsive Single-Page (DE/FR), die das alte Bootstrap/jQuery-Template ersetzt. Custom HTML/CSS/JS, kein Framework. Awwwards-Level, warm-dunkles Design, kreisförmige Overhead-Teller als zentrales visuelles System.

**Quelle der Wahrheit:** Specs in `_bmad-output/C-UX-Scenarios/` + `data/demo-data.json` (Content).

---

## Setup-Entscheidungen (Step 1)

| Frage | Entscheidung |
|-------|--------------|
| Device | **Fully Responsive** (mobile-first + Tablet + Desktop) |
| Sprachen | **DE + FR** bilingual (Toggle, localStorage `ilgusto-lang`) |
| Design-Fidelity | **Design-System** (echte Tokens aus Specs — keine Graumodelle) |
| Build-Ort | **Eigenständiger `prototype/`-Ordner** (null Risiko fürs alte Site; Integration/Deploy nach Freigabe → `public/`) |
| Teller-Platzhalter | **Gradient-Kreise** (Demo-Stil); EVis generiert freigestellte PNGs selbst, später eingesetzt in `assets/plates/` |

---

## Design Tokens (aus Specs)

| Token | Wert |
|-------|------|
| Seiten-Hintergrund | `#141210` |
| Reveal-Layer | `#1a1612` |
| Gold-Akzent | `#c9a84c` |
| Headline-hell | `#e8e0d0` / `#f0e8d8` |
| Body warm | `#a89c88` / `#c0b8a8` |
| Gedämpft | `#3a3530` / `#2a2520` |
| Display-Font | Georgia, italic |
| UI/Label-Font | Helvetica Neue (uppercase, letter-spacing) |

---

## Sections (Single-Page, Scroll-Reihenfolge)

| # | Anchor | Section | Spec | Demo-Vorlage | Status |
|---|--------|---------|------|--------------|--------|
| 1 | `#hero` | Hero | [01.1](../_bmad-output/C-UX-Scenarios/01-anna-entscheidet-sich/01.1-hero/01.1-hero.md) | page-load-demo / plate-reveal-v3 | ⬜ todo |
| 2 | `#about` | Über uns | [01.1b](../_bmad-output/C-UX-Scenarios/01-anna-entscheidet-sich/01.1b-ueber-uns/01.1b-ueber-uns.md) | — | ⬜ todo |
| 3 | `#menu` | Speisekarte | [01.2](../_bmad-output/C-UX-Scenarios/01-anna-entscheidet-sich/01.2-speisekarte/01.2-speisekarte.md) | menu-demo | ⬜ todo |
| 4 | `#gallery` | Galerie | [02.2](../_bmad-output/C-UX-Scenarios/02-marco-entdeckt-ilgusto/02.2-galerie/02.2-galerie.md) | plate-reveal-v3 | ⬜ todo |
| 5 | `#reservation` | Reservierung | [01.3](../_bmad-output/C-UX-Scenarios/01-anna-entscheidet-sich/01.3-reservierung/01.3-reservierung.md) | — | ⬜ todo |
| — | footer | Footer (Impressum, Kontakt) | — | — | ⬜ todo |

**Build-Reihenfolge:** Setup/Shell (Nav + Tokens + Lang-Toggle) → Hero → Über uns → Speisekarte → Galerie → Reservierung → Footer → Integration.

---

## Folder Structure

```
prototype/
├── PROTOTYPE-ROADMAP.md   (this file)
├── index.html             (single page — built section by section)
├── data/
│   └── demo-data.json     (all content, DE/FR — source of truth)
├── shared/                (css tokens, lang toggle, utils)
├── components/            (reusable section partials if needed)
├── stories/               (per-section implementation guides, just-in-time)
├── work/                  (planning files)
├── assets/
│   └── plates/            (freigestellte Teller-PNGs — von EVis)
└── pages/
```

---

## Cross-Cutting Constraints (WICHTIG)

- **Authentizität:** KEINE behauptete italienische Herkunft, KEINE Inhaber-Namen, KEIN "Tradition seit…". Siehe Memory `ilgusto-owners-positioning`.
- **Reservierung:** resmio primär (native embed, Design-angepasst) — Embed-Code/Konto-Zugang ist TODO; bis dahin Button → resmio-Widget-URL. DSGVO-Consent prüfen.
- **Firebase:** Bestehendes Kontaktformular-Backend (`functions/`) bleibt erhalten; Deploy-Ziel ist `public/` (erst nach Freigabe).
- **Bilingual:** Jeder sichtbare Text DE+FR über `data-de`/`data-fr` + `setLang()`.

---

## Offene Asset-/Content-TODOs (blockieren NICHT den Build, aber den Launch)

- [ ] Freigestellte Overhead-Teller-PNGs (EVis generiert)
- [ ] Vollständige Speisekarte (Hauptspeisen 8, Dessert 6) + Signature-★ mit Kunde
- [ ] resmio Embed-Code + Konto-Zugang + DSGVO-Consent
- [ ] Interior-Foto für Über uns
- [ ] Finale Galerie-Gericht-Auswahl
- [ ] Nav-Entscheidung "Über uns" aufnehmen?
