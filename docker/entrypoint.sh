#!/bin/bash
set -e

cd /app

# Run Drupal deploy tasks if the database is reachable.
if ./vendor/bin/drush sql:connect 2>/dev/null; then
  echo "Running Drupal deploy tasks..."
  ./vendor/bin/drush state:set system.maintenance_mode 1 --input-format=integer
  ./vendor/bin/drush updatedb -y
  ./vendor/bin/drush config:import -y
  ./vendor/bin/drush cache:rebuild
  ./vendor/bin/drush state:set system.maintenance_mode 0 --input-format=integer
  echo "Deploy tasks complete."
else
  echo "Database not reachable — skipping deploy tasks."
fi

# Hand off to the default webdevops entrypoint (starts nginx + php-fpm via supervisord).
exec /opt/docker/bin/entrypoint.sh supervisord
