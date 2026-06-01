# Project Brief: Il Gusto Website Redesign

> Simplified Brief - Essential context for design work

**Created:** 2026-06-01
**Author:** EVis
**Brief Type:** Simplified

---

## Project Scope

Full redesign of the existing restaurant website for **Ristorante Il Gusto** (ilgusto-sb.de) — an authentic Italian fine dining restaurant at Saargemünder Str. 45, 66271 Kleinblittersdorf (Rilchingen-Hanweiler), Saarland.

**What we are building:** A single-page website (German) that replaces the current Bootstrap/jQuery template with an Awwwards-level, custom-designed web experience. Key sections: Hero, About, Menu, Gallery, Reservation/Contact.

**Platform:** Custom HTML/CSS/JS. Static site, no CMS required. Firebase for contact form (already in use). Desktop + mobile.

**Site type:** Restaurant marketing site with reservation CTA.

---

## Positioning — LOCKED

**Target position:** #1 Italian restaurant in the greater Saarbrücken area.

**Strategic reality:**
- Restaurant is 2 years old — still building awareness and customer base
- Food quality is already there (verified: 4.9★ Google, 144 reviews, #1 Kleinblittersdorf)
- **The gap is not quality — it's visibility and perceived status**
- The website must close that gap: new visitors must immediately recognise this as the best Italian in the region, not discover it by accident

**The social proof weapon:**
4.9★ with 130+ reviews after only 2 years is exceptional — comparable to established city-centre restaurants with 10x the foot traffic. This number must be surfaced prominently, early, and with context ("after 2 years, 130 guests have spoken").

**Positioning statement for the site:**
> Das beste Italienische Restaurant im Saarbrücken-Umland. Seit 2 Jahren. 4,9 Sterne.

---

## Challenge / Opportunity

Il Gusto is rated **4.9★ on Google (144 reviews)** and **#1 of 49 restaurants** in Kleinblittersdorf. TripAdvisor reviewers call it "one of the best restaurants in Saarland." The restaurant already has a strong brand voice: *"Italian Fine Dining — Frisch. Elegant. Unvergesslich."*

**The gap:** The current website is built on a 2014-era Bootstrap template (jQuery 1.11.1, Nivo Lightbox) and communicates none of this quality. The brand tagline appears nowhere on the site. The design does not match the actual dining experience.

**The opportunity:** A website that matches the restaurant's real quality will strengthen reservations, attract new guests from the Saarbrücken/French border area, and position Il Gusto as the premium Italian dining destination in the region.

---

## Design Goals

1. **Match the experience:** The website should feel like the restaurant — elegant, warm, unhurried. Not corporate. Not generic.
2. **Awwwards-level execution:** Custom layouts, scroll narrative, strong typography. Reference sites: Tastavents (tastavents.com, Awwwards HM Oct 2024), Laguna Al-Sha'ab (Awwwards HM Oct 2025).
3. **Brand tagline lives:** "Frisch. Elegant. Unvergesslich." must be present and felt — not just stated.
4. **Signature front and center:** Hausgemachte Pasta is the emotional core the restaurant is known for — design and copy should surface this.
5. **Reservation-first:** The primary conversion action is a table reservation. Must be accessible from every section.
6. **Not overloaded:** Generous whitespace, minimal colour palette, food photography as the hero. Less is more.

---

## Interaction Design — LOCKED

**Plate Reveal: Clip-Path Circle Expand**
- Teller in Gallery sind anklickbar
- Click → schwarzer Kreis expandiert vom exakten Teller-Mittelpunkt aus (clip-path circle expand)
- Expand-Layer hat denselben warmen Dunkelton wie die Seite (#1a1612 auf #141210) — kein harter Kontrastwechsel
- Großer Teller erscheint links, Gericht-Info rechts daneben
- Schließen: Kreis zieht sich zurück an Ursprungsposition
- Kein Modal, kein Overlay-Rechteck — der Teller-Kreis ist die Maske
- Referenz-Technik: Balans Kitchen (Awwwards Clip-Path Scroll)

**Seiten-Farbschema:** Warm dunkel — `#141210` Basis, nicht Cream/Weiß

---

## Visual Direction — LOCKED

**Central design concept:** Overhead food photography, background removed, presented as floating circular elements directly integrated into the page layout.

- **Photography angle:** Pure overhead (90°) — new shoot commissioned by restaurant owner
- **Treatment:** Background removed (transparent PNG) — plate floats on page background
- **Crop:** Circular — the plate shape becomes the visual unit
- **Role:** Central design element, not decorative gallery. Plates are the page.
- **Reference style:** Awwwards-editorial — plates used like art objects, large, with generous whitespace around them

**Photography brief for restaurant:**
- Shoot straight down (90° overhead), camera centered over plate
- Neutral background preferred (dark slate, white marble, or matte black) for clean removal
- Each signature dish: Ravioli di Vitello, Tortelloni al Salmone, Carpaccio di Manzo, Wolfsbarschfilet, Antipasto, Tiramisu (minimum 6 shots)

**Existing overhead shots (usable until new photos arrive):**
- `archive/Carpaccio di Manzo.jpg` — ⭐ best existing overhead
- `archive/Tortelloni al Sedano.jpg` — ⭐ excellent overhead
- `archive/Tagliatelle con Spinaci.jpg` — ⭐ excellent overhead
- `archive/Fileto di Merluzzo.jpg` — good overhead
- `archive/graved lachs.jpg` — good overhead (kitchen bg)

---

## Constraints

- **Tech stack:** Static HTML/CSS/JS. No framework requirement. GSAP or native CSS animations for scroll effects. Existing Firebase contact form backend to be preserved.
- **Content:** Rich image archive exists in `public/img/Ilgusto/` (20+ dish photos, interior shots, gallery). No new photo shoot budgeted — must work with existing assets.
- **Languages:** German (DE) + French (FR) — bilingual. Restaurant is at the French border (Kleinblittersdorf / Forbach-Sarreguemines area). French-speaking cross-border guests are a key audience (Marco persona).
- **Brand assets:** No formal logo file — current site uses text "Il Gusto". Typography choice will serve as brand mark.
- **Scope limit:** Single-page redesign. No CMS, no online booking system integration (phone reservation only: +49 6805 9439490).
- **Design system mode:** None (per WDS config).

---

## Restaurant Facts (Reference)

| | |
|---|---|
| Address | Saargemünder Str. 45, 66271 Kleinblittersdorf |
| Phone | +49 6805 9439490 |
| Email | mail@ilgusto-sb.de |
| Hours | Tue–Sat 17:00–22:00 · Sun 12:00–14:00 & 18:00–21:00 · Mon closed |
| Capacity | 35–40 guests · Summer terrace |
| Google | 4.9★ (144 reviews) |
| TripAdvisor | 5.0★ · #1 Kleinblittersdorf |
| Instagram | @ristorante.ilgusto · "Frisch. Elegant. Unvergesslich." |
| Price range | €15–38 per dish |

---

## Next Steps

- [x] **Phase 1: Product Brief** — complete
- [ ] **Phase 2: Trigger Map** — complete (see B-Trigger-Map/)
- [ ] **Phase 3: UX Scenarios** — next
- [ ] **Phase 4: Specifications** — follows
- [ ] **Phase 5: Agentic Development** — build

---

_Generated by WDS — Research-based brief, EVis + Freya_
