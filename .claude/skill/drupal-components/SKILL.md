# Drupal Components Skill

Use this skill when the user asks to create, modify, or review HPM Drupal components (paragraphs, node templates, elements). This skill ensures components match the HTML template source and align with the canonical component specification.

## Trigger

Activate when the user mentions:
- Creating or adding a new component/paragraph
- Modifying an existing component template
- Reviewing component alignment with the template
- "component", "paragraph", "template" in context of the HPM theme

## Sources of Truth

### 1. Component Specification (CANONICAL)
`./260125-hpm-components.numbers` — defines every component's fields, options, and constraints. This is the single source of truth for what fields exist and how components behave. Parse with `numbers-parser` Python library if needed.

### 2. HTML Template Source
`~/git/hpm-website-template/src/twig/` — the static Twig templates that define the exact HTML structure, CSS classes, and layout. Drupal templates MUST match this markup.

### 3. Drupal Theme
`web/themes/custom/hpm/` — the Drupal implementation where components live as paragraph templates.

## Component Specification Reference

Below is the full component spec extracted from `260125-hpm-components.numbers`. Fields marked with `*` are required.

### Components

#### alternate
- **BE Name:** Inhalte alternierend
- **Fields:** meta, headline *, content (editor), accordion, button
- **Options:** theme: weiß/beige/rot/dunkel, accordion: y/n, media position: left/right
- **Notes:** Accordion optional. Image: 1200x800px (3:2)

#### application
- **BE Name:** Bewerbungsinfo
- **Fields:** headline, text, small text, button
- **Options:** theme: weiß/beige
- **Notes:** Fallback for form, contact option

#### application-form
- **BE Name:** Bewerbungsformular
- **Fields:** section: headline, introtext; form: titel (hidden), vorname, nachname, email, telefonnummer, quelle, location
- **Options:** theme: weiß/beige
- **Notes:** Email with attachments to defined address

#### benefits
- **BE Name:** Benefits
- **Fields:** meta, title *, (items)
- **Options:** theme: weiß/beige

#### benefits-item (child of benefits)
- **BE Name:** Benefit
- **Fields:** icon, headline, description
- **Notes:** Icons 1:1 aspect ratio (SVG)

#### blocks
- **BE Name:** Blocks
- **Fields:** meta, title *, button, (items)
- **Options:** theme: weiß/beige

#### blocks-item (child of blocks)
- **BE Name:** Block
- **Fields:** meta, headline *, text *

#### box-teaser
- **BE Name:** Teaser-Box mit Bild
- **Fields:** logo, headline, text, bild
- **Options:** theme: weiß/beige, type: small/large, box-position: rechts/links
- **Notes:** Image: 1200x800px (3:2)

#### deeplink
- **BE Name:** Text mit Link
- **Fields:** headline, editor-content, button
- **Options:** theme: weiß/beige

#### gallery
- **BE Name:** Galerie
- **Fields:** (items), gallery text
- **Options:** theme: weiß/beige

#### gallery-item (child of gallery)
- **BE Name:** Galerie-Element
- **Fields:** image, credits, caption
- **Notes:** No fixed image format

#### intro
- **BE Name:** Intro
- **Fields:** meta, text *, button
- **Options:** theme: weiß/beige

#### job-intro
- **BE Name:** Stelleninformationen
- **Fields:** meta, title, location (bundesweit/standort), startzeit (sofort/datum), level (Berufseinsteiger/Berufserfahrene)

#### job-offers
- **BE Name:** Stellenangebote
- **Fields:** (items)
- **Options:** theme: weiß/beige

#### job-offers-item (child of job-offers)
- **BE Name:** Stellenangebot
- **Fields:** Position, Standort, Level

#### location-project-details
- **BE Name:** Standort / Projekt
- **Fields:** meta *, headline *, back-link, bild *, formatted text *, Kunde (Projekt), Budget (Projekt), Umfang (Projekt), Laufzeit (Projekt), Status: laufend/abgeschlossen (Projekt), Leistungen (Liste), Kontaktdaten (Standort) *, maps-link (Standort) *
- **Notes:** Article page for both locations and projects. Some fields context-dependent. Project property fields shown only when filled. Leistungen list allows unlimited entries.

#### locations-overview
- **BE Name:** Standorte-Übersicht
- **Fields:** (items)

#### locations-teaser-item
- **BE Name:** Standort-Teaser
- **Fields:** image, credits, city, contact-data, email, link

#### map-teaser
- **BE Name:** Standorte-Teaser
- **Fields:** meta, text *, button
- **Options:** theme: dark/beige

#### narrative
- **BE Name:** Narrativ-Element mit Bild
- **Fields:** id *, bild *, credits, headline, formatted text (editor) *, accordion, button
- **Options:** box-position: rechts/links, box-theme: red/dark, accordion: ja/nein

#### news
- **BE Name:** Nachrichtenliste
- **Notes:** Load fixed count (e.g. 12), load more on click. Max 60 displayed.

#### news-item (child of news)
- **BE Name:** Nachricht
- **Fields:** image, credits, date *, category *, headline *, content (editor) *, link
- **Notes:** Theme from item position

#### news-teaser
- **BE Name:** Newsslider
- **Fields:** meta, title *, button, (items), slider text
- **Options:** theme: weiß/beige
- **Notes:** Max 60 items

#### news-teaser-item (child of news-teaser)
- **BE Name:** Newsslider-Item
- **Fields:** image *, credits, date *, category *, headline *, content (editor) *, link *
- **Notes:** Content from news articles

#### people
- **BE Name:** Personen
- **Fields:** title, (items)
- **Options:** theme: weiß/beige

#### people-item (child of people)
- **BE Name:** Person
- **Fields:** bild *, credits, Name *, Beschreibung *, E-Mail
- **Notes:** Image: 600x800px (3:4)

#### poster
- **BE Name:** Team-Poster
- **Fields:** meta *, title *, title-text *, bild *
- **Options:** theme: weiß/beige

#### projects-overview
- **BE Name:** Projektübersicht
- **Options:** theme: weiß/beige
- **Notes:** Filter via bef-links plugin

#### projects-teaser
- **BE Name:** Projekte-Slider
- **Fields:** title, (items)
- **Options:** theme: weiß/beige

#### projects-teaser-item (child of projects-teaser)
- **BE Name:** Projekt-Teaser
- **Fields:** image, credits, projekt (headline), text, button
- **Notes:** Image: 720x480px (3:2)

#### quotes
- **BE Name:** Zitate-Slider
- **Fields:** (items)
- **Options:** theme: weiß/beige

#### quotes-item (child of quotes)
- **BE Name:** Zitat
- **Fields:** image *, credits, quote *, author *
- **Notes:** Theme auto-assigned per item. Image: 1200x800px (3:2)

#### segments
- **BE Name:** Geschäftsfelder
- **Fields:** (items)

#### segments-item (child of segments)
- **BE Name:** Geschäftsfeld
- **Fields:** id *, title *, bild *, credits *, headline 1 *, formatted text 1 (editor) *, Leistungen-Liste *, headline 2, formatted text 2 (editor), projects teaser
- **Options:** theme auto-generated from list position
- **Notes:** Each item needs ID linked from segments-overview. Optional projects teaser-slider.

#### segments-overview
- **BE Name:** Geschäftsfelder-Übersicht
- **Fields:** (items)
- **Options:** theme: weiß/beige

#### segments-overview-item (child of segments-overview)
- **BE Name:** Geschäftsfeld-Teaser
- **Fields:** link-target (id of segment), image, number, segment (= headline), text

#### services
- **BE Name:** Kompetenzen
- **Fields:** (items)

#### services-item (child of services)
- **BE Name:** Kompetenz
- **Fields:** meta *, headline *, bild *, credits, text *, liste, accordion
- **Options:** theme auto-generated from list position
- **Notes:** Image: 1200x800px

#### stage-media
- **BE Name:** Bild-Stage
- **Fields:** bild *, meta, headline *
- **Options:** type: visual/map/image
- **Notes:** Different types for different pages. Image: 1200x800px

#### stage-slider
- **BE Name:** Stage-Slider

#### stage-slider-item (child of stage-slider)
- **BE Name:** Stage-Slider Slide
- **Fields:** Bild (landscape) *, Bild (portrait) *, caption, credits
- **Notes:** Landscape + portrait per slide. Landscape: 1920x800px, Portrait: 500x650px

#### stage-title
- **BE Name:** Seitenüberschrift
- **Fields:** meta, title *

#### text-block
- **BE Name:** Textbereich
- **Fields:** formatted text (editor)
- **Options:** One large editor field

#### timeline
- **BE Name:** Chronik
- **Fields:** headline, (items)
- **Options:** theme: weiß/beige

#### timeline-item (child of timeline)
- **BE Name:** Chronik-Eintrag
- **Fields:** year, text
- **Notes:** Color from list position

## Implementation Patterns

### File Locations

| Type | Location |
|------|----------|
| Paragraph templates | `web/themes/custom/hpm/templates/paragraph/paragraph--{name}.html.twig` |
| Node templates | `web/themes/custom/hpm/templates/node/node--{type}.html.twig` |
| Reusable components | `web/themes/custom/hpm/templates/components/` |
| SVG vectors | `web/themes/custom/hpm/images/vectors/` |
| Component CSS | `web/themes/custom/hpm/css/src/components.{name}.css` |
| JS source | `web/themes/custom/hpm/js/src/` |
| JS dist | `web/themes/custom/hpm/js/dist/` |
| Libraries | `web/themes/custom/hpm/hpm.libraries.yml` |
| Preprocess | `web/themes/custom/hpm/hpm.theme` |
| Template source | `~/git/hpm-website-template/src/twig/components/{name}.twig` |
| Template items | `~/git/hpm-website-template/src/twig/items/{name}-item.twig` |
| Template elements | `~/git/hpm-website-template/src/twig/elements/{name}.twig` |

### Template Anatomy

Every paragraph template follows this structure:

```twig
{#
/**
 * @file
 * Component name – brief description.
 *
 * Fields: field_name1, field_name2, etc.
 * Optional: additional field documentation.
 */
#}
{{ attach_library('hpm/library-name') }}  {# Only if JS needed #}
{% set local_var = paragraph.field_name.value|default('fallback') %}
<section{{ attributes.addClass('component-name', 'content-section') }}
  {% if theme_css %}data-theme="{{ theme_css }}"{% endif %}>
  <div class="section-container">
    {# Content matches template source HTML exactly #}
  </div>
</section>
```

### Key Conventions

1. **Attributes:** Always use `{{ attributes.addClass(...) }}` on the root element for Drupal integration
2. **Theme support:** Use `{% if theme_css %}data-theme="{{ theme_css }}"{% endif %}` when the component supports theme options
3. **Field access patterns:**
   - Simple text: `paragraph.field_name.value`
   - With striptags: `paragraph.field_name.value|striptags`
   - Rich text (raw HTML): `paragraph.field_text.value|raw`
   - Rendered field (images, references): `content.field_name`
   - Check if populated: `paragraph.field_name.value` or `content.field_name|render|trim`
   - Entity reference items: `paragraph.field_items` (loop), `item.entity` (get entity)
   - Media entity image URL: `file_url(media_entity.field_media_image.entity.uri.value)`
4. **Button links:** Preprocessed in `hpm.theme` — use `button_url` and `button_text` variables, include the reusable button component:
   ```twig
   {% include '@hpm/templates/components/button-link.html.twig' with {
     url: button_url,
     text: button_text,
     variant: 'secondary'
   } only %}
   ```
5. **SVG icons:** Include via `{% include '@hpm/images/vectors/name.svg.twig' %}`
6. **JS hooks:** Use `js-` prefixed classes: `js-element-group`, `js-zoom-image`, `js-accordion`, `js-stage-slider`, etc.
7. **Animation targets:** `js-element-group` for GSAP fade-ins, `js-zoom-image` for scroll zoom, `data-delay` for stagger
8. **Slider components:** Use Splide structure: `.splide > .splide__track > .splide__list > .splide__slide`
9. **Section titles:** Common pattern for meta + title header used in benefits, news-teaser, etc.

### Theme Color System

- **CSS data-theme values:** `red`, `darkred`, `beige` (mapped from field_theme storage values: `brand`→`red`, `dark`→`darkred`, `beige`→`beige`)
- **Auto-cycling colors** (quotes, timeline): `lightblue`, `red`, `beige`, `darkgreen` — assigned by `loop.index0 % 4`
- **Tailwind color classes:** `bg-hpm-red`, `bg-hpm-darkred`, `bg-hpm-beige`, `bg-hpm-lightblue`, `bg-hpm-darkgreen`, `text-hpm-red`, `text-hpm-darkred`
- **White text on dark backgrounds:** Apply `text-white` when color is `red` or `darkgreen`

### CSS Architecture

- Global styles: `css/src/tailwind.css` (Tailwind v4 config with @theme)
- Component CSS files: `css/src/components.{name}.css` — use `@layer components { }`
- Button styles: `css/src/buttons-links.css`
- Formatted text: `css/src/formatted.css`
- Theme variations: `css/src/themes.css`
- Build: `npm run build:css` (from theme directory)

### Library System

When a component needs JS, add it to `hpm.libraries.yml`:

```yaml
slider-name:
  js:
    js/dist/slider-name.js: { minified: true }
  dependencies:
    - hpm/splide      # For slider components
    - hpm/gsap        # For animation components
```

Attach in template: `{{ attach_library('hpm/slider-name') }}`

### PHP Preprocessing (hpm.theme)

The `hpm_preprocess_paragraph()` function handles:
- **Theme mapping:** `field_theme` values → CSS `data-theme` attribute
- **Button extraction:** `field_link` → `button_url` + `button_text` variables
- **Item position:** `segments_item` delta calculation for alternating themes

When adding new preprocessing, add to `hpm_preprocess_paragraph()` in `hpm.theme`.

## Workflow: Creating a New Component

1. **Check the spec:** Look up the component in `260125-hpm-components.numbers` for fields and options
2. **Read the template source:** Open `~/git/hpm-website-template/src/twig/components/{name}.twig` (and items if applicable)
3. **Check for existing Drupal template:** Look in `web/themes/custom/hpm/templates/paragraph/`
4. **Create/update the Drupal template:** Match the template source HTML structure exactly, adapting:
   - Static variables → Drupal field access (`paragraph.field_name.value`)
   - Static includes → `@hpm/` namespaced includes
   - Button links → reusable button component with preprocessed variables
   - Add `{{ attributes.addClass(...) }}` on root element
   - Add theme support if specified in the spec
5. **Add CSS if needed:** Create `css/src/components.{name}.css`, import in `tailwind.css`
6. **Add JS if needed:** Create JS file, add library to `hpm.libraries.yml`, attach in template
7. **Add preprocessing if needed:** Update `hpm_preprocess_paragraph()` in `hpm.theme`
8. **Build CSS:** Run `npm run build:css` from the theme directory
9. **Export config if Drupal entity changes were made:** `ddev drush cex -y`, then verify `core.extension.yml` has `profile: minimal`

## Workflow: Modifying an Existing Component

1. **Check the spec:** Verify the change aligns with `260125-hpm-components.numbers`
2. **Read the template source:** Check `~/git/hpm-website-template/src/twig/components/{name}.twig` for the canonical markup
3. **Read the current Drupal template:** `web/themes/custom/hpm/templates/paragraph/paragraph--{name}.html.twig`
4. **Make changes:** Ensure HTML structure still matches the template source
5. **Rebuild if CSS changed:** `npm run build:css` from theme directory

## Validation Checklist

When reviewing a component, verify:
- [ ] Fields match the spec in `260125-hpm-components.numbers`
- [ ] HTML structure matches `~/git/hpm-website-template/src/twig/components/{name}.twig`
- [ ] Tailwind classes are consistent with the template source
- [ ] `{{ attributes.addClass(...) }}` is on the root element
- [ ] Theme support (`data-theme`) is present when spec lists theme options
- [ ] Button uses the reusable `button-link.html.twig` component
- [ ] JS hooks use `js-` prefix convention
- [ ] Library attached if JS is needed
- [ ] Images use correct aspect ratios per spec
- [ ] Required fields (marked with `*`) have conditional rendering where needed