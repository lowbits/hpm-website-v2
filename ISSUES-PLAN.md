# HPM Website v2 — Open Issues & Plan

_Updated: 2026-04-20 | 15 open issues_

---

## Overview by Category

### Bugs / Functional Issues
| # | Title | Priority | Effort | Notes |
|---|-------|----------|--------|-------|
| **#99** | Verlinkung von Projekten in Geschäftsfeldern funktioniert nicht | HIGH | M | Projekte werden nicht in zugeordneten Geschäftsfeldern angezeigt; manuelle Teaser entfernen |

### Content Type Changes — Stellenangebote (#103, #104, #105)
| # | Title | Priority | Effort | Notes |
|---|-------|----------|--------|-------|
| **#103** | Feld "Einleitung" nach oben verschieben + reines Textfeld | MED | S | Form Display Reihenfolge + Feldtyp ändern |
| **#104** | Tab "Zusätzliche Inhalte" entfernen | MED | S | Nicht mehr benötigter Tab |
| **#105** | Variable Bilder (Auswahl aus 4 vordefiniert) | MED | M | Vorauswahl-Feld unter "Allgemein" — **Rücksprache nötig** |

### Content Type Changes — Person (#108)
| # | Title | Priority | Effort | Notes |
|---|-------|----------|--------|-------|
| **#108** | Person: Felder "Position" + "Standort" statt "Beschreibung" | HIGH | M | + pro Personen-Komponente Option welches Feld ausgegeben wird; Credits-Feld entfernen |

### Content Type Changes — Neuigkeit (#101, #107)
| # | Title | Priority | Effort | Notes |
|---|-------|----------|--------|-------|
| **#101** | Pflichtfelder: Datum, News-Bild, Inhalt | MED | S | Feldkonfiguration anpassen |
| **#107** | Option "In neuem Fenster öffnen" für externe Links | MED | S | Checkbox am Link-Feld |

### Component / Paragraph Changes (#98, #100, #102)
| # | Title | Priority | Effort | Notes |
|---|-------|----------|--------|-------|
| **#98** | "Segments Overview" → "Geschäftsfelder Übersicht" umbenennen | LOW | S | Label-Rename im Paragraph Type |
| **#100** | Standorte: Karriere-Block aus "Blöcke" einfügen | MED | M | Fester Block (alternierende Inhalte) unten auf allen Standort-Seiten |
| **#102** | Narrativ: Feldreihenfoge im Backend anpassen | LOW | S | Accordion nach Text, Bild nach Accordion, Caption+Link entfernen |

### Frontend / Theming (#86, #109)
| # | Title | Priority | Effort | Notes |
|---|-------|----------|--------|-------|
| **#86** | Responsive Images | MED | L | Alle Bilder responsive machen — Größen jetzt in #109 definiert |
| **#109** | Bildgrößenangaben in Komponenten anpassen (Hilfstexte) | LOW | S | Backend-Hilfstexte mit korrekten Maßen aktualisieren — nach #86 |

### Site-wide Features (#106, #52)
| # | Title | Priority | Effort | Notes |
|---|-------|----------|--------|-------|
| **#106** | Social Media Links zentral verwalten | MED | M | Ein-/Ausblenden + URL zentral (Block/Config) für Nav + Footer |
| **#52** | Navigation: Struktur, dynamische Pfeile, Links fixen | MED | M | Älteres Ticket, Pfeile dynamisch statt hardcoded |

### Infra / Nicht-Dev
| # | Title | Priority | Effort | Notes |
|---|-------|----------|--------|-------|
| **#87** | Wartungsvertrag mit Sibel | — | — | Orga-Ticket, kein Dev-Task |

---

## Vorgeschlagene Reihenfolge

### Sprint 1 — High Priority & Quick Wins
1. **#99** — Projekt-Verlinkung in Geschäftsfeldern reparieren (Bug, sichtbar für Nutzer)
2. **#101** — Neuigkeit Pflichtfelder setzen (schnell, verhindert unvollständige Inhalte)
3. **#103** — Stellenangebote: Einleitung-Feld verschieben + Typ ändern
4. **#104** — Stellenangebote: Tab "Zusätzliche Inhalte" entfernen
5. **#98** — Segments Overview umbenennen (30 Sek. Rename)
6. **#102** — Narrativ: Feldreihenfolge anpassen

### Sprint 2 — Inhaltliche Strukturänderungen
7. **#108** — Person: Neue Felder Position/Standort + Ausgabesteuerung (größerer Umbau)
8. **#107** — News externe Links: Checkbox "neues Fenster"
9. **#100** — Standorte: Karriere-Block einbinden

### Sprint 3 — Features mit Rücksprache
10. **#105** — Stellenangebote: Variable Bilder (**Rücksprache nötig**)
11. **#106** — Social Media Links zentral verwalten
12. **#52** — Navigation dynamische Pfeile

### Sprint 4 — Responsive Images & Cleanup
13. **#86** — Responsive Images (Größen jetzt definiert)
14. **#109** — Hilfstexte in Komponenten aktualisieren (nach #86)

### Nicht-Dev
- **#87** — Wartungsvertrag (Orga, separat klären)

---

## Offene Fragen / Rücksprache nötig
- **#105**: Soll es ein Dropdown mit 4 vordefinierten Bildern sein? Oder ein List(radio)-Feld?
- **#108**: Logik bestätigen — "Position ausgeben" / "Standort ausgeben" als Checkboxen am Paragraph?
- **#106**: Wo zentral verwalten? (Menu block? Custom config form? Site Settings Modul?)

---

_Effort: S = Small (< 1h), M = Medium (1-4h), L = Large (4h+)_
