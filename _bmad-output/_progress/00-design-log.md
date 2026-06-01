# Design Log: Il Gusto Website Redesign

**Project:** Il Gusto Website Redesign (ilgusto-sb.de)
**Started:** 2026-06-01
**Method:** Whiteport Design Studio (WDS) v6

---

## Progress

### 2026-06-01 — Phase 1: Product Brief Complete

**Agent:** Saga (Strategic Analyst) + EVis research session
**Output:** Simplified brief from research context

**Artifacts Created:**
- `A-Product-Brief/project-brief.md` — Simplified project brief with locked visual direction and positioning

**Summary:** Brief created from extensive research session (restaurant profile, Awwwards analysis, image audit). Key locked decisions: "Frisch. Elegant. Unvergesslich." as brand narrative, Awwwards-level design direction (Tastavents/Laguna-style), overhead food photos as central visual element (circular, background-removed), #1 Italian restaurant in Saarbrücken-Umland as positioning target.

**Next:** Phase 2 — Trigger Map

---

### 2026-06-01 — Phase 2: Trigger Map Complete

**Agent:** Saga (Strategic Analyst) + EVis
**Output:** Trigger Map with 3 personas from research context

**Artifacts Created:**
- `B-Trigger-Map/trigger-map.md` — Trigger Map hub with Mermaid visualization
- `B-Trigger-Map/02-Anna-the-Local.md` — Primary persona
- `B-Trigger-Map/03-Marco-the-Visitor.md` — Secondary persona
- `B-Trigger-Map/04-Petra-the-Planner.md` — Tertiary persona

**Summary:** Three personas identified from research. Anna the Local (PRIMARY) is the highest-volume decision maker who checks the website before calling. Restaurant is 2 years old, 4.9★ (144 reviews) — the quality is proven but the website doesn't show it. Social proof weaponized as positioning anchor.

**Next:** Phase 3 — UX Scenarios

---

### 2026-06-01 — Phase 5: Awwwards-Politur + Scroll-Narrative

**Agent:** Implementation Partner (Freya) + EVis
**Kontext:** Prototyp gegen Awwwards-Referenzen geprüft (Tastavents, Laguna, Canlis, HIO, Flavori). Scorecard: 8× erfüllt, Lücken = echte Teller-Fotos (🔴) + Scroll-Narrative/Motion (🟡).

**Umgesetzt:**
- **Dramatische Typografie:** Hero-Headline monumental (bis 96px, line-height 0.98, neg. letter-spacing); Section-Titel größer/straffer
- **Teller-Parallax:** alle Teller (Hero/About/Menu/Reservierung) schweben scroll-getrieben (`data-parallax` + `initParallax`, translate3d, prefers-reduced-motion-safe)
- **Scroll-Narrative:** nummerierte Kapitel als Gold-Eyebrows (italienisch, von EVis freigegeben): I La Famiglia · II La Cucina · III La Galleria · IV Riservazione; + fixe Kapitel-Rail rechts (Desktop ≥1100px) mit Active-Sync via IntersectionObserver

**Verbleibende Lücke:** echte freigestellte Overhead-Teller-PNGs (EVis generiert) = der finale visuelle Sprung. Platzhalter aktuell = Gradient-Kreise.

**Lokaler Server:** http://localhost:8753 (python http.server in prototype/).

---

### 2026-06-01 — Phase 5: Single-Page Prototyp GEBAUT

**Agent:** Implementation Partner (Freya) + EVis
**Activity:** [P] Prototyping — section-by-section mit Approval-Gates

**Output:** `prototype/` — eigenständige, responsive Single-Page (DE/FR), custom HTML/CSS/JS, kein Framework
- `index.html` · `shared/styles.css` · `shared/app.js` · `data/demo-data.json`

**Gebaute Sections (alle approved):**
0. Shell — Tokens, sticky Nav, DE/FR-Toggle (localStorage), Smooth-Scroll, Scrollspy, Page-Load-Reveal
1. Hero — Eyebrow/Headline/Rating, Teller-Platzhalter, Scroll-Indikator. Telefon → eleganter "Reservieren →"-Link (EVis-Wunsch). Nav faded mit rein (nichts sichtbar bei Start).
2. Über uns — finale Familien-Copy, Stat-Zeile, Foto mit **gefederten Kanten** (kein in-your-face Rechteck) + Teller-Akzent
3. Speisekarte — 4 Akkordeon-Kategorien (alle zu), 16 Gerichte, Signature-★, Tageskarte, floating Teller
4. Galerie — 6 nackte Teller (asymm.), **Clip-Path-Reveal** (gelockt), CTA → #reservation
5. Reservierung — resmio primär (Platzhalter-Button → Widget-URL; nativer Embed TODO), Telefon sekundär, Öffnungszeiten/Adresse, Gruppen
6. Footer — Kontakt, Öffnungszeiten, Instagram, Impressum, Copyright

**Setup-Entscheidungen:** eigenständiger `prototype/`-Ordner (0 Risiko); Gradient-Kreis-Platzhalter für Teller (EVis liefert PNGs); Content inline (data-de/data-fr) für SEO.

**Verifiziert:** HTTP 200, alle 6 Section-Anker, 9 JS-Module, CSS balanciert, lokal serviert (http://localhost:8753).

**Launch-TODOs:** Teller-PNGs · volle Speisekarte (8/6) · Signature-★ Kundencheck · resmio nativer Embed + DSGVO · Interior-Foto · Nav "Über uns"? · Impressum übernehmen · Integration nach `public/` + Firebase-Deploy.

**Next:** Feinschliff/Acceptance-Testing oder Integration nach `public/`.

---

### 2026-06-01 — Phase 4: Copy-Konsistenz-Pass

**Agent:** Freya + EVis
**Scope:** Alle Sections gegen Authentizitäts-Constraint (keine Fake-Italien-Herkunft) + Stimme/DE-FR-Konsistenz

**Befunde & Fixes:**
- Hero-Eyebrow (01.1): "Authentische Italienische Küche" → **"Italian Fine Dining · Kleinblittersdorf"** (echte Brand-Bio, kein Herkunfts-Claim, DE+FR angeglichen)
- Hero-Rating FR (01.1): "144 avis clients" → **"144 clients ont parlé"** (gleiche "haben gesprochen"-Stimme wie DE)
- Speisekarte / Galerie / Reservierung: **sauber**, keine Verstöße (italienische Gericht-Namen auf der Karte sind legitim)

**Roter Faden bestätigt:** "144 Gäste haben gesprochen" (Hero) → "wir lassen den Teller sprechen" (Über uns) → "ist die Antwort" — konsistente Stimme.

**Hinweis:** EVis generiert die Overhead-Teller-PNGs selbst (eins nach dem anderen).

---

### 2026-06-01 — Phase 4: Über uns (01.1b / #about) spezifiziert

**Agent:** Freya (WDS Designer) + EVis
**Activity:** [P] Write Specifications (+ Awwwards About-Section-Recherche)

**Recherche (auf EVis-Wunsch — About-Sections der Referenz-Restaurants):**
- **Canlis**: Familien-Mehr-Generationen-Prosa, menschliche Öffnungszeile, Awards subtil eingewoben
- **Tastavents** (gelockt): Römische Ziffern, poetisch, nur 60–80 Wörter, Bilder tragen
- **MEIER** (dt. Familienbetrieb): "Familiengeschichte", Herzlichkeit + Handwerk, Stimmungsfoto statt Portrait
- **Erkenntnis:** Il Gusto kann kein Jahrhunderte-Erbe spielen (2 Jahre) — Stärke ist die junge Familie, die in 2 Jahren Nr. 1 wurde

**Neuer Fakt (von EVis):** Il Gusto ist ein **Familienunternehmen** → zentraler emotionaler Anker

**Artifacts Created:**
- `C-UX-Scenarios/01-anna-entscheidet-sich/01.1b-ueber-uns/01.1b-ueber-uns.md`

**Decisions (interaktiv mit EVis):**
- Story-Ansatz: **Familienbetrieb + "2 Jahre, 4,9★"** (Achievement statt Erbe)
- Content: **Struktur jetzt, Copy als TODO** (Freya-Entwurf aus Research möglich)
- Bild: **Interior-Foto + kleiner floating Teller kombiniert** (Stimmungsfoto-Muster)

**Offene TODOs:** Interior-Foto-Auswahl · Nav "Über uns"? · optionale Gründungs-Anekdote · Kunden-Sign-off Copy

**Update (Copy festgelegt):** Inhaber sind Sajmir Goga & Alban Hyka (Schwager), **albanisch** mit italienischem Restaurant → Copy bewusst OHNE Herkunfts-Behauptung/Namen. Authentizität via Familie + Handwerk + Ergebnis. Headline: "Wir lassen den Teller sprechen." (verzahnt mit Teller-Designsystem). Festgelegte DE+FR-Copy für Headline/Story/Stats. Siehe Memory `ilgusto-owners-positioning`.

**Milestone:** Alle Kern-Sections spezifiziert — Hero · Über uns · Speisekarte · Galerie · Reservierung ✓

**Next:** 02.1 Hero (Marco) oder Übergang zu Phase 5/6 (Asset-Generierung / Development)

---

### 2026-06-01 — Phase 4: Galerie (02.2) spezifiziert

**Agent:** Freya (WDS Designer) + EVis
**Activity:** [P] Write Specifications

**Artifacts Created:**
- `C-UX-Scenarios/02-marco-entdeckt-ilgusto/02.2-galerie/02.2-galerie.md` — rückentwickelt aus `plate-reveal-v3.html`

**Decisions (interaktiv mit EVis):**
- Teller-Verhalten: **nackt** (kein Text) bis Klick — Mystery, Klick enthüllt Details
- Gericht-Set: 6-Demo als **Platzhalter**, finale Auswahl nach Fototermin (TODO)
- Post-Galerie-CTA: **Link zur Reservierungs-Section** (#reservation, resmio)
- Plate-Reveal (Clip-Path Circle Expand) als LOCKED-Interaktion vollständig spezifiziert

**Offene TODOs:** finale Gericht-Auswahl + freigestellte Overhead-PNGs; Accessibility-Konzept für Reveal

**Next:** Über uns (#about)

---

### 2026-06-01 — Phase 4: Reservierung (01.3) spezifiziert

**Agent:** Freya (WDS Designer) + EVis
**Activity:** [P] Write Specifications (+ Web-Recherche Reservierungssystem)

**Recherche-Ergebnis:**
- Restaurant nutzt **resmio** als Reservierungssoftware (Widget: `app.resmio.com/ristorante-il-gusto/widget`)
- resmio ist **Reserve-with-Google-Partner** → der "Tisch reservieren"-Button im Google-Profil führt auf resmio
- Eigene Website zeigt aktuell nur Telefon/E-Mail; resmio läuft separat über Google

**Artifacts Created:**
- `C-UX-Scenarios/01-anna-entscheidet-sich/01.3-reservierung/01.3-reservierung.md`

**Decisions (interaktiv mit EVis):**
- Reservierungsweg: **resmio primär** (24/7 online), **Telefon sekundär**
- Einbindung: **Native Embed** — resmio-Widget im dunklen Gold-Design (kein Stilbruch)
- Petra (Gruppen 10–40) via Gruppen-Hinweis + E-Mail berücksichtigt

**Offene TODOs (an EVis):**
- resmio-Konto-Zugang / offiziellen Embed-Code besorgen
- DSGVO-Consent für resmio-iframe klären

**Milestone:** Szenario 01 (Anna) vollständig spezifiziert — Hero · Speisekarte · Reservierung ✓

**Next:** Szenario 02 (Galerie / Marco) oder Über uns

---

### 2026-06-01 — Phase 4: Speisekarte (01.2) spezifiziert

**Agent:** Freya (WDS Designer) + EVis
**Activity:** [P] Write Specifications

**Artifacts Created:**
- `C-UX-Scenarios/01-anna-entscheidet-sich/01.2-speisekarte/01.2-speisekarte.md` — vollständige Page-Spec, rückentwickelt aus dem funktionierenden `menu-demo.html` Prototyp

**Decisions (interaktiv mit EVis):**
- Teller-Platzierung: **Option B** — ein floating Overhead-Teller begleitet die Section (Leitmotiv aus Hero fortgeführt)
- Akkordeon-Startzustand: **alle Kategorien geschlossen** (ruhiger Überblick, Whitespace = Luxus)
- 4 Kategorien: Vorspeisen · Hausgemachte Pasta · Hauptspeisen · Dessert, je mit Preis-Range + Count
- DE/FR bilingual, geteiltes Sprach- & Nav-System mit Hero

**Offene TODOs (an EVis):**
- Vollständige Gerichtlisten Hauptspeisen (8) + Dessert (6) einpflegen
- Signature-Dishes (★) mit Kunde abstimmen

**Next:** 01.3 Reservierung

---

### 2026-06-01 — Phase 3: UX Scenarios Complete

**Agent:** Freya (WDS Designer) + EVis
**Scenarios:** 2 scenarios covering 5 sections
**Quality:** Excellent (both 7/7, 7/7, 6/6, 4/4)

**Artifacts Created:**
- `C-UX-Scenarios/00-ux-scenarios.md` — Scenario index + coverage matrix
- `C-UX-Scenarios/01-anna-entscheidet-sich/01-anna-entscheidet-sich.md` — Scenario 01 outline
- `C-UX-Scenarios/01-anna-entscheidet-sich/01.1-hero/01.1-hero.md` — Step 01.1 page spec stub
- `C-UX-Scenarios/02-marco-entdeckt-ilgusto/02-marco-entdeckt-ilgusto.md` — Scenario 02 outline
- `C-UX-Scenarios/02-marco-entdeckt-ilgusto/02.1-hero/02.1-hero.md` — Step 02.1 page spec stub
- `C-UX-Scenarios/02-marco-entdeckt-ilgusto/02.2-galerie/02.2-galerie.md` — Step 02.2 page spec stub

**Summary:** Two scenarios defined — Anna's reservation decision (PRIMARY, covers Hero/About/Menu/Contact) and Marco's visual discovery (SECONDARY, Gallery as conviction point). Key decision: 4,9★ social proof anchored in Hero, not footer. Circular overhead food plates as central visual system locked in brief. New photography shoot commissioned by restaurant (overhead only, background-removable).

**Next:** Phase 4 — Specifications [SP]

---

## Current

_Single-Page Prototyp gebaut + Awwwards-Politur (Parallax, dramatische Typo, Scroll-Narrative I–IV). Wartet auf: echte Teller-PNGs (EVis), dann Integration nach public/._

## Backlog

- [ ] 02.1 Hero — Spec für Marco-Szenario (oder Verweis auf 01.1)
- [ ] 01.2 Speisekarte — vollständige Gerichtlisten einpflegen (Open Q#2, vor Dev)
- [ ] 01.2 Speisekarte — Signature-Dishes mit Kunde abstimmen (Open Q#4)
- [ ] 01.3 Reservierung — resmio Embed-Code & Konto-Zugang besorgen (Open Q#1)
- [ ] 01.3 Reservierung — DSGVO-Consent für resmio-iframe klären (Open Q#2)

## Design Loop Status

| Scenario | Step | Page | Status | Date |
|----------|------|------|--------|------|
| 01-anna-entscheidet-sich | 01.1 | Hero | specified | 2026-06-01 |
| 01-anna-entscheidet-sich | 01.1b | Über uns (#about) | specified | 2026-06-01 |
| 01-anna-entscheidet-sich | 01.2 | Speisekarte | specified | 2026-06-01 |
| 01-anna-entscheidet-sich | 01.3 | Reservierung | specified | 2026-06-01 |
| 02-marco-entdeckt-ilgusto | 02.2 | Galerie | specified | 2026-06-01 |
| single-page | — | Il Gusto Prototyp | building | 2026-06-01 |
| single-page | — | Il Gusto Prototyp | built | 2026-06-01 |

---

## Key Decisions

| Date | Decision | Phase | Made By |
|------|----------|-------|---------|
| 2026-06-01 | Overhead food photos, background removed, circular crop as central visual element | Phase 1 | EVis + Freya |
| 2026-06-01 | 4,9★ (144 reviews) anchored in Hero — not footer | Phase 3 | EVis + Freya |
| 2026-06-01 | Positioning: #1 Italienisches Restaurant im Saarbrücken-Umland | Phase 1 | EVis |
| 2026-06-01 | New overhead photo shoot to be commissioned by restaurant owner | Phase 1 | EVis |
| 2026-06-01 | Simplified Brief + Trigger Map created from research context (skipped full workflow) | Phase 1–2 | EVis + Freya |
