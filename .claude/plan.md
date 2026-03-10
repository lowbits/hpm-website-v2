# HPM Website v2 — Issue Plan

Work through all 43 open GitHub issues in a logical order, grouped by complexity and dependency.

---

## Phase 1: Quick Config Wins (Field Reordering & Renaming)
Low-risk changes that improve the editorial UX immediately.

- [ ] #23 — Rename "Section Title" to "Bereichsüberschrift" site-wide
- [ ] #39 — Rename Standort tab "Inhalte" to "Weitere Inhalte"
- [ ] #8 — Reorder fields: Bild-Stage (Darstellungsvariante → Meta-Label → Überschrift → Bild)
- [ ] #10 — Reorder fields: Inhalte alternierend (Farbschema → Medienposition → Meta-Label → Überschrift → Unterüberschrift → Text → Link → Akkordeon)
- [ ] #12 — Reorder fields: Benefits (Theme → Meta-Label → Section Title → Items)
- [ ] #13 — Reorder fields: Benefit Item (Icon → Überschrift → Text)
- [ ] #14 — Reorder fields: Blocks (Theme → Meta-Label → Section Title → Link → Items)
- [ ] #15 — Reorder fields: Block Item (Meta-Label → Überschrift → Text)
- [ ] #17 — Reorder fields: Zitat Item (Zitat → Autor → Bild → Credits)
- [ ] #20 — Reorder fields: Team-Poster (Meta-Label → Überschrift → Text → Bild)
- [ ] #22 — Reorder fields: Personen (Theme → Section Title → Items)
- [ ] #25 — Reorder fields: Chronik-Eintrag Item (Jahr → Text)
- [ ] #28 — Reorder fields: Standorte Teaser (Farbschema → Meta-Label → Text → Link)
- [ ] #30 — Reorder fields: Seitenüberschrift (Meta-Label → Überschrift)
- [ ] #31 — Reorder fields: Teaser-Box (Anzeigengröße → Medienseite → White Spacer → Logo → Überschrift → Zitat → Text → Link → Bild)
- [ ] #33 — Reorder fields: News content type (Datum → Kategorie → Titel → News-Bild → Inhalt → Link)
- [ ] #36 — Reorder fields: Intro (Theme → Meta-Label → Text → Link)

## Phase 2: Media Credits & System Config
Enable centralized credits on media entities, then global settings.

### 2a: Centralize Credits on Media (#38)
- [ ] #38 — Enable `field_credits` on media image form + view display (field already exists, just hidden)
- [ ] #38 — Update templates to render credits from media entity instead of paragraph fields
- [ ] #38 — Remove redundant `field_credits` from paragraph types (services_item, segments_item, quote_item, projects_teaser_item, locations_teaser_item, gallery_item)
- [ ] #40 — Gallery credits now resolved: template reads credits from media entity automatically

### 2b: System & Global Config
- [ ] #7 — Allow SVG file uploads
- [ ] #9 — Fix URL alias pattern (remove "Stellenanzeigen" prefix, use top-level)
- [ ] #11 — Hide Item paragraph types from section selection (only show Components)
- [ ] #6 — Enable bulk media uploader (install/configure module)

## Phase 3: Missing Fields & Components
Add missing fields and new components.

- [ ] #2 — Add Caption field to Stage Slider Slide
- [ ] #19 — Add Caption field to "Inhalte alternierend"
- [ ] #27 — Add Caption field to "Narrativ-Element"
- [ ] #24 — Add Accordion to "Narrativ-Element" (like "Inhalte alternierend")
- [ ] #21 — Fix "Teaser-Box mit Bild": add white spacer checkbox, media side, quote field; rename "Text" to "Text/Autor"
- [ ] #37 — Add Teaser-Bild + Caption fields to Standort content type
- [ ] #41 — Add text field below gallery in Standort
- [ ] #43 — Create "Textblock" component

## Phase 4: Display & Template Fixes
Fix rendering issues in Twig templates and CSS.

- [ ] #1 — Fix Stage Slider Slide: Bildunterschrift not visible
- [ ] #16 — Fix Benefits Meta-Label rendering
- [ ] #34 — Fix News-Slider: title shown as category
- [ ] #42 — Use "Stadt" field as page title + backend overview for Standort
- [ ] #44 — Fix "Text mit Bild" (.deeplink): two-column left-aligned layout on larger viewports

## Phase 5: Navigation
Fix header and navigation structure.

- [ ] #4 — Header Menu Button: add label, fix CSS animations
- [ ] #5 — Navigation: fix layout, missing elements, buttons, effects
- [ ] #32 — Navigation: implement second-level sub-menus (Standorte, Karriere)

## Phase 6: JavaScript & Animations
Fix slider scripts and animation behavior (compare with static preview).

- [ ] #3 — Stage Slider: fix animation behavior, slider controls, caption animation
- [ ] #18 — Quote-Slider: fix script to match preview
- [ ] #26 — Chronik: fix choppy slide animation, last entry line issue
- [ ] #29 — Standorte Teaser: fix map and content animations

---

## Notes
- **Preview reference**: https://hpm.marckloubert.com/ (dev:dev)
- **Live dev site**: https://hpm.lowbits.de/de
- After config changes, always run `ddev drush cex -y` and verify `core.extension.yml` has `profile: minimal`
- Close issues with `gh issue close <number>` after each fix is committed