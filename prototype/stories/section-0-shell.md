# Story: Section 0 — Shell

**Goal:** Fundament der Single-Page — HTML-Gerüst, Design-Tokens, sticky Nav (Logo, Links, DE/FR-Toggle), Sprach-System, Smooth-Scroll, Page-Load-Hook. Sektions-Container als leere Anker.

**Spec:** Nav aus [01.1 Hero](../../_bmad-output/C-UX-Scenarios/01-anna-entscheidet-sich/01.1-hero/01.1-hero.md) (hero-nav, NAV-01–03)

## Acceptance
- [x] index.html mit `<html lang="de">`, SEO-Meta (Title/Description DE)
- [x] Sticky Nav: Logo (Gold, Georgia italic), Links (Speisekarte·Galerie·Reservieren), DE/FR-Toggle
- [x] Nav-Scroll-State: kompakter ab 80px Scroll
- [x] Sprach-Toggle: tauscht alle `data-de`/`data-fr`, localStorage `ilgusto-lang`, default de
- [x] Smooth-Scroll für Anchor-Links
- [x] Mobile: Hamburger < 768px
- [x] Leere Sektions-Anker: #hero #about #menu #gallery #reservation + footer
- [x] Tokens als CSS-Variablen in styles.css

## Notes
- Content inline (data-de/data-fr) für SEO + file:// — kein fetch.
- setLang nutzt innerHTML (für `<br>` in Headlines); Content ist eigen, kein User-Input.
