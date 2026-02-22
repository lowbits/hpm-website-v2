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

## Coding Standards
- Follow Drupal coding standards: https://www.drupal.org/docs/develop/standards
- Use `ddev drush phpcs` for code style checks
- Use `ddev drush phpstan` for static analysis