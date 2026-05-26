# Migration Plan: Coolify → Host Europe (cPanel + SSH)

## Current Setup (Coolify)
- **Drupal**: 11.3.8
- **PHP**: 8.3
- **Database**: MariaDB 10.11
- **Web Server**: nginx (via `webdevops/php-nginx:8.3` Docker image)
- **Build**: Multi-stage Docker (Node for Tailwind/Rollup assets, PHP for app)
- **Entrypoint**: Custom `docker/entrypoint.sh` runs on container start
- **Contrib modules**: ~31 Drupal packages
- **Install profile**: `minimal`

## Target Setup (Host Europe)
- **Hosting**: cPanel shared/managed hosting
- **Server**: sxb1plzcpnl509437
- **SSH**: `ssh hosteurope` (config in `~/.ssh/config`)
- **User**: d9wk9gxzatk4
- **PHP**: 8.3.30 (CLI + OPcache)
- **Composer**: 2.9.5
- **Database**: MariaDB 10.6.24, host: `localhost`, db: `hpm_neu`, user: `hpm_neu`
- **Node.js**: NOT available — build assets locally
- **Document root**: `/home/d9wk9gxzatk4/public_html`
- **Home**: `/home/d9wk9gxzatk4`

---

## Pre-Migration Checklist

### 1. Verify Host Europe Environment
- [x] SSH into Host Europe — **working** (`ssh hosteurope`)
- [x] Convert `.ppk` key to OpenSSH format — **done** (`~/.ssh/id_rsa_frontend_design`)
- [x] Check PHP version — **8.3.30 confirmed**
- [x] Check available PHP extensions — **all required present** (gd, mbstring, pdo_mysql, opcache, json, xml, curl, intl, imagick, zip)
- [x] Check MySQL version — **MariaDB 10.6.24 confirmed**
- [x] Find MySQL host — **`localhost`**, db: `hpm_neu`, user: `hpm_neu`
- [x] Check Composer — **2.9.5 confirmed**
- [x] Check Node.js — **NOT available**, will build assets locally
- [x] Check available disk space — **725GB free** (2TB total)
- [x] Identify document root — **`/home/d9wk9gxzatk4/public_html`**
- [x] Check existing content — `www_hpm/` contains the **current static HTML site** (htpasswd-protected), `www_hdc/` and `oldsite.hoecker-pm.com/` also present
- [ ] Check if cPanel's Drupal installer is useful or if manual install is better

### 2. Check cPanel Drupal Installer
- [ ] Check which Drupal version cPanel offers (likely Drupal 10.x, probably NOT 11.3)
- [ ] **Decision**: If cPanel only offers Drupal 10.x → manual install is required
- [ ] Note: We use `minimal` install profile + heavy config, so cPanel auto-install is likely NOT suitable

---

## Migration Steps

### Phase 1: Prepare Host Europe Server

1. **Create MySQL database + user via cPanel**
   - Note the database name, user, password, and host
   - Grant all privileges on the database to the user

2. **Set up SSH access**
   - Convert PPK → OpenSSH format if on macOS/Linux
   - Add SSH config entry for easy access
   - Test connection

3. **Install Composer** (if not available)
   ```bash
   curl -sS https://getcomposer.org/installer | php
   mv composer.phar ~/bin/composer
   ```

4. **Verify PHP CLI version matches web PHP**
   - cPanel often has multiple PHP versions
   - Set PHP version in cPanel → MultiPHP Manager
   - Ensure CLI also uses 8.3: check `php -v` vs cPanel setting

### Phase 2: Export from Coolify

5. **Database dump from Coolify**
   ```bash
   # On Coolify container:
   /app/vendor/bin/drush sql-dump --gzip > /tmp/hpm-db-export.sql.gz
   ```
   - Download the dump file
   - Alternatively: `ddev drush sql-dump --gzip > hpm-db-export.sql.gz` (from local dev if DB is in sync)

6. **Export files directory**
   - Download `web/sites/default/files/` from Coolify container
   - This contains all uploaded media/assets

7. **Export current config**
   ```bash
   /app/vendor/bin/drush cex -y
   ```
   - Verify config is committed in `config/sync/`

### Phase 3: Deploy to Host Europe

8. **Upload codebase**
   - Option A: `git clone` on the server (if Git is available)
   - Option B: `rsync` or `scp` the project files
   - Target: document root or subdirectory

9. **Build theme assets**
   - Option A (on server, if Node available):
     ```bash
     cd web/themes/custom/hpm && npm ci && npm run build
     ```
   - Option B (build locally, upload dist):
     ```bash
     # Locally:
     cd web/themes/custom/hpm && npm run build
     # Then rsync css/dist/ and js/dist/ to server
     ```

10. **Install PHP dependencies**
    ```bash
    composer install --no-dev --optimize-autoloader
    ```

11. **Configure settings.php**
    - Set database credentials in `web/sites/default/settings.php`
    - Set `$settings['trusted_host_patterns']` for the new domain
    - Set `$settings['config_sync_directory']` (should already be `../config/sync`)
    - Set file permissions: `chmod 444 web/sites/default/settings.php`

12. **Import database**
    ```bash
    gunzip < hpm-db-export.sql.gz | mysql -u USER -p DATABASE
    ```

13. **Upload files directory**
    - Upload to `web/sites/default/files/`
    - Set permissions: `chmod -R 775 web/sites/default/files/`

14. **Run Drupal updates**
    ```bash
    vendor/bin/drush cr
    vendor/bin/drush updb -y
    vendor/bin/drush cim -y
    vendor/bin/drush cr
    ```

### Phase 4: Web Server Configuration

15. **Configure .htaccess / Apache**
    - cPanel uses Apache (not nginx like Coolify) — Drupal ships with `.htaccess` so this should work out of the box
    - Enable `mod_rewrite` if not already (check cPanel → Apache Handlers)
    - Check clean URLs work

16. **Set up cron**
    - cPanel → Cron Jobs
    - Add: `*/15 * * * * cd /home/USER/public_html && vendor/bin/drush cron`

17. **SSL certificate**
    - cPanel → SSL/TLS or AutoSSL
    - Ensure HTTPS is working

### Phase 5: DNS & Go-Live

18. **Test on Host Europe URL first** (before DNS switch)
    - Use server IP or temporary cPanel URL
    - Verify all pages, media, forms work

19. **Switch DNS**
    - Update A record / nameservers to Host Europe
    - TTL: lower beforehand if possible (e.g., 300s)

20. **Post-migration verification**
    - [ ] Homepage loads correctly
    - [ ] All media/images display
    - [ ] Forms submit properly
    - [ ] Admin login works
    - [ ] Cron runs successfully
    - [ ] Config import clean (`drush cst`)

---

## Key Differences: Coolify (Docker) → cPanel

| Aspect | Coolify | Host Europe (cPanel) |
|--------|---------|---------------------|
| Web server | nginx | Apache |
| Build | Docker multi-stage | Manual composer + npm |
| Deploy | Git push → auto-build | Manual upload / git pull |
| Cron | Container entrypoint | cPanel cron job |
| PHP config | Dockerfile | cPanel MultiPHP |
| SSL | Coolify auto-SSL | cPanel AutoSSL |
| DB | Container MariaDB | cPanel MySQL |

## Risks & Concerns

- ~~**PHP version**: cPanel might not offer PHP 8.3~~ — **confirmed available**
- **Composer memory**: Shared hosting may have low memory limits, `composer install` might fail
  - Workaround: `COMPOSER_MEMORY_LIMIT=-1 composer install` or install locally and upload `vendor/`
- **Node.js**: May not be available on cPanel — build assets locally
- **Performance**: Moving from Docker/VPS to shared hosting may be slower
- **No CI/CD**: Need manual deployment process (or set up a simple git-based workflow)
- **cPanel Drupal installer**: Almost certainly won't have Drupal 11.3 and won't use `minimal` profile — avoid it

## CI/CD: GitHub Actions Deploy Pipeline

### GitHub Secrets to Add (Settings → Secrets → Actions)
1. `SSH_PRIVATE_KEY` — run `cat ~/.ssh/id_rsa_frontend_design | pbcopy` and paste
2. `SSH_HOST` — `92.205.2.186`
3. `SSH_USER` — `d9wk9gxzatk4`

### Workflow File
- `.github/workflows/deploy.yml` — triggers on push to `main` + manual dispatch

### Workflow Overview (`.github/workflows/deploy.yml`)
```
Trigger: push to main

Jobs:
  1. Build & Deploy
     ├── Checkout code
     ├── Setup Node 24 → npm ci → npm run build (theme assets)
     ├── Setup PHP 8.3 → composer install --no-dev --optimize-autoloader
     ├── rsync to Host Europe (exclude .git, .ddev, node_modules, etc.)
     └── SSH: drush cr, drush updb -y, drush cim -y, drush cr
```

### rsync Strategy
- Deploy to: `/home/d9wk9gxzatk4/public_html/www_hpm_drupal/` (parallel to static site)
- When ready to go live: rename `www_hpm` → `www_hpm_static` and `www_hpm_drupal` → `www_hpm`
- Exclude: `.git/`, `.ddev/`, `node_modules/`, `.env`, `web/sites/default/files/` (user uploads stay on server)
- Use `--delete` cautiously — exclude files dir to not wipe uploads

### settings.php Strategy
- `settings.php` on the server contains DB credentials, trusted hosts, etc.
- Do NOT overwrite on deploy — either:
  - a) Exclude from rsync, or
  - b) Use `settings.local.php` for server-specific config (gitignored)

### Drush Path on Host Europe
- Drush: `/home/d9wk9gxzatk4/public_html/www_hpm/vendor/bin/drush`
- Or add to PATH in the SSH step

## Open Questions

- [x] What is the MySQL host? — **`localhost`**, db/user: `hpm_neu`
- [x] What PHP versions does Host Europe offer? — **PHP 8.3 confirmed**
- [ ] Is the current domain staying the same or changing?
- [ ] Is there an existing site on Host Europe that needs to be preserved/removed?
- [x] Do we want to set up Git-based deployments or manual uploads? — **GitHub Actions CI/CD**
