# Logical View Map — Il Gusto

**Created:** 2026-06-01 · WDS Phase 5, Step 2

## Views

| View | Type | Composed of |
|------|------|-------------|
| Il Gusto Single-Page | Single scrolling page (no routing) | Shell + 6 sections |

Alle Scenario-Steps laufen auf EINER Seite zusammen:
- **Anna (01):** #hero → #about → #menu → #reservation
- **Marco (02):** #hero → #gallery → #reservation

Gleiche Seite, verschiedene Scroll-Pfade. Nav + Sprach-Toggle + Teller-System sind geteilt.

## Build Order

0. Shell (Nav, Tokens, Sprach-System, Smooth-Scroll, Page-Load)
1. Hero (#hero)
2. Über uns (#about)
3. Speisekarte (#menu)
4. Galerie (#gallery) — höchste Komplexität (Clip-Path-Reveal)
5. Reservierung (#reservation)
6. Footer
→ Integration & Finalisierung
