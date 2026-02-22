#!/bin/bash
set -e

cd /app

if ./vendor/bin/drush sql:query "SELECT 1" 2>&1; then
  if ./vendor/bin/drush status --field=bootstrap 2>/dev/null | grep -q "Successful"; then
    echo "Running Drupal deploy tasks..."
    ./vendor/bin/drush state:set system.maintenance_mode 1 --input-format=integer
    ./vendor/bin/drush updatedb -y
    ./vendor/bin/drush config:import -y
    ./vendor/bin/drush cache:rebuild
    ./vendor/bin/drush state:set system.maintenance_mode 0 --input-format=integer
    echo "Deploy tasks complete."
  else
    echo "Fresh install — installing Drupal from existing config..."
    ./vendor/bin/drush site:install --existing-config -y
    echo "Install complete."
  fi
else
  echo "Database not reachable — skipping deploy tasks."
fi

exec /opt/docker/bin/entrypoint.sh supervisord
