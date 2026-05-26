# HPM Website v2

Drupal 11 Website for HOECKER Project Managers.

## Tech Stack

- **CMS**: Drupal 11.3
- **PHP**: 8.3
- **Database**: MariaDB
- **Theme**: Custom (`web/themes/custom/hpm/`) mit Tailwind CSS v4 + Rollup
- **Local Dev**: DDEV

## Local Development

```bash
ddev start
ddev drush uli   # Login-Link generieren
```

URL: `https://hpm-website-v2.ddev.site:33004`

## Deployment

### Übersicht

Automatisches Deployment via **GitHub Actions** auf Host Europe (cPanel + SSH).
Jeder Push auf `main` triggert ein Deployment.

### Ablauf

```
Push auf main
    │
    ▼
GitHub Actions (.github/workflows/deploy.yml)
    │
    ├── 1. Theme Assets bauen (Node 24: Tailwind CSS + Rollup JS)
    │
    ├── 2. SSH auf Server: git clone in neues Release-Verzeichnis
    │      └── .git/ wird nach Clone gelöscht (Speicherplatz)
    │
    ├── 3. Gebaute CSS/JS per rsync auf den Server kopieren
    │
    ├── 4. Auf dem Server:
    │      ├── Symlinks für shared files erstellen
    │      ├── composer install --no-dev
    │      ├── PHP-Handler + Basic Auth in .htaccess einfügen
    │      ├── Symlink auf neues Release umschalten
    │      ├── drush updatedb
    │      ├── drush config:import
    │      └── drush cache:rebuild
    │
    └── 5. Alte Releases aufräumen (letzte 5 behalten)
```

### Manuelles Deployment

Kann auch manuell über GitHub Actions ausgelöst werden:
Repo → Actions → "Deploy to Host Europe" → Run workflow

### Server-Struktur

```
/home/d9wk9gxzatk4/public_html/
├── releases/                        # Alle Release-Verzeichnisse
│   ├── 2026-05-26-135033/
│   └── 2026-05-27-093000/
├── shared/                          # Geteilte Dateien (persistent)
│   ├── files/                       # Drupal uploads/media
│   ├── private/                     # Private Drupal files
│   └── settings.local.php           # DB-Credentials (nicht in Git)
├── www_hpm_drupal -> releases/...   # Symlink auf aktives Release
├── www_hpm/                         # Alte statische Website
└── .htpasswd                        # Basic Auth Passwort
```

### Rollback

Bei Problemen nach einem Deploy — Symlink auf vorheriges Release setzen:

```bash
ssh hosteurope
cd ~/public_html
ln -sfn releases/VORHERIGES_RELEASE www_hpm_drupal
cd www_hpm_drupal && ./vendor/bin/drush cr
```

### GitHub Secrets & Variables

**Secret** (Settings → Secrets → Actions):
- `SSH_PRIVATE_KEY` — SSH Private Key für den Server

**Environment Variables** (Settings → Environments → production):
- `SSH_HOST` — Server IP
- `SSH_USER` — SSH Benutzername

### SSH-Zugang

```bash
ssh hosteurope    # Konfiguriert in ~/.ssh/config
```

### Integration/Staging

- **URL**: https://integration.hoecker-pm.com
- **Basic Auth**: `hpm` / `Vorschau2026!`
- Subdomain zeigt auf `www_hpm_drupal/web`
