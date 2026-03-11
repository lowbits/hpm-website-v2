# HPM Website v2

## Project Overview
Drupal 11.3 website using DDEV for local development.

## Tech Stack
- **CMS**: Drupal 11.3
- **PHP**: 8.3
- **Database**: MariaDB 10.11
- **Web Server**: nginx-fpm
- **Local Dev**: DDEV
- **CLI**: Drush 13.x

## Local Development
- **URL**: https://hpm-website-v2.ddev.site:33001
- Start: `ddev start`
- Stop: `ddev stop`
- SSH into container: `ddev ssh`
- Run Drush: `ddev drush <command>`
- Run Composer: `ddev composer <command>`

## Project Structure
- `web/` - Drupal docroot
- `web/modules/custom/` - Custom modules
- `web/themes/custom/` - Custom themes
- `recipes/` - Drupal recipes
- `vendor/` - Composer dependencies (not committed)
- `.ddev/` - DDEV configuration

## MCP Integration
This project has a Drupal MCP server configured in `.mcp.json` that provides tools for interacting with the Drupal site (content types, entities, config, etc.) via Drush.

## Template Source
- Template source: `~/git/hpm-website-template/` (has both Tailwind CSS AND SCSS — check both)
- Drupal theme: `web/themes/custom/hpm/`
- CSS build: `npx @tailwindcss/cli -i css/src/tailwind.css -o css/dist/style.css --minify` (run from theme dir)

## Docker Build Pipeline
- Dockerfile has a multi-stage build: Stage 1 (node) runs `npm run build` (Tailwind CSS + Rollup JS), Stage 2 (PHP) copies app + overlays built assets
- `js/src/` files are the SOURCE — rollup compiles them to `js/dist/` during Docker build
- Always update `js/src/` when changing `js/dist/` — the build will overwrite dist from src
- Only `main.js` and `stage-slider.js` have src files; other sliders are dist-only

## CRITICAL: Install Profile
- Deployed site uses `minimal` install profile, NOT `standard`
- `core.extension.yml` MUST have `profile: minimal` AND `minimal: 1000` in the module list
- NEVER export config without verifying this is correct
- After ANY `ddev drush cex`, always check `core.extension.yml` for the profile value

## CRITICAL: Config UUIDs
- NEVER use placeholder/fake UUIDs in config files
- Always generate real UUIDs with `uuidgen` when creating new config YAML files
- Fake UUIDs can collide with existing config on prod and cause deploy failures

## Config Export Checklist
After every `ddev drush cex -y`:
1. Verify `profile: minimal` in `config/sync/core.extension.yml`
2. Verify `minimal: 1000` is in the module list
3. Verify `standard` is NOT in the module list

## Theme: Button Arrow Animation
- Arrow hover animation is defined in SCSS in the original template (`src/scss/elements/_buttons.scss`)
- Keyframe: `button-icon-slide-right` — 1s, easeInOutQuad, infinite, fade-out-right + fade-in-left

## Commit Preferences
- Do NOT add Co-Authored-By lines to commits

## Coding Standards
- Follow Drupal coding standards: https://www.drupal.org/docs/develop/standards
- Use `ddev drush phpcs` for code style checks
- Use `ddev drush phpstan` for static analysis