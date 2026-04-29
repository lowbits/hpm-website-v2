---
name: pre-push-review
description: Review all unpushed commits for code quality, best practices, and regressions before pushing. Use before git push or when asked to review/audit changes. Trigger on "review before push", "check code quality", "pre-push review".
risk: low
source: custom
---

# Pre-Push Review

Comprehensive review of all unpushed changes before pushing to remote.

## When to Use

- Before pushing commits to remote
- When user asks to review or audit recent changes
- After completing a batch of tickets

## Workflow

### Step 1: Identify Changes

1. Find all unpushed commits:
   ```bash
   git log origin/main..HEAD --oneline
   ```
2. Get the full diff:
   ```bash
   git diff origin/main..HEAD --stat
   ```

### Step 2: Config Sync Integrity

CRITICAL: Verify config is in sync between YAML files and database.
```bash
ddev drush cim -y   # import YAML → database
ddev drush cex -y   # export database → YAML
```
If the second command shows changes, something was out of sync. This catches the common bug where YAML edits were never imported before a `drush cex` overwrote them.

Then run the Config Export Checklist:
- [ ] `core.extension.yml`: `profile: minimal`
- [ ] `core.extension.yml`: `minimal: 1000` in module list
- [ ] `core.extension.yml`: `standard` NOT in module list
- [ ] No placeholder/fake UUIDs in new config files

### Step 3: Config YAML Review

For each changed config file:
- [ ] Valid YAML syntax (no tabs, correct indentation)
- [ ] Dependencies section matches actual field/module usage
- [ ] No orphaned config (referencing fields/types that don't exist)

### Step 4: PHP Code Review (hpm.theme, custom modules)

- [ ] Follows Drupal coding standards (docblocks, spacing, naming)
- [ ] No unused `use` statements
- [ ] No hardcoded strings that should be translatable
- [ ] Proper null checks and error handling
- [ ] No deprecated API usage for Drupal 11
- [ ] Services accessed correctly (`\Drupal::` acceptable in .theme files)

### Step 5: Twig Template Review

- [ ] No hardcoded content that should be dynamic
- [ ] Proper use of `|escape`, `|raw` only where safe
- [ ] `{% include %}` paths use `@hpm/` namespace
- [ ] No orphaned/unused templates
- [ ] `ignore missing` used for optional includes
- [ ] Accessibility: alt texts, ARIA labels present

### Step 6: JavaScript Review (if changed)

- [ ] Source files in `js/src/` updated (not just `js/dist/`)
- [ ] No console.log or debug statements
- [ ] Drupal behaviors pattern used correctly

### Step 7: CSS/Tailwind Review (if changed)

- [ ] Responsive breakpoints consistent (sm, md, lg, xl)
- [ ] Build command works:
  ```bash
  cd web/themes/custom/hpm && npx @tailwindcss/cli -i css/src/tailwind.css -o css/dist/style.css
  ```

### Step 8: Regression Check

- [ ] Modified templates still render all original fields
- [ ] Removed code: grep for any remaining references to deleted functions/variables
- [ ] Shared templates (page.html.twig, 404): changes apply consistently
- [ ] View config changes: filters, sorts, access still correct

### Step 9: Cleanup Check

- [ ] No leftover debug code or TODO comments
- [ ] No commented-out code blocks
- [ ] No unintended files staged (.DS_Store, node_modules, etc.)

### Step 10: Report

Output a summary:
```
## Pre-Push Review

### Commits: <count>
### Files changed: <count>

### Issues Found:
- [ ] <issue 1>

### Clean: <yes/no>
### Safe to push: <yes/no>
```