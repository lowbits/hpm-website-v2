#!/bin/bash
set -e

cd /app

echo "=== Debug: Environment ==="
echo "DB Host: $DRUPAL_DB_HOST"
echo "DB Name: $DRUPAL_DB_NAME"
echo "DB User: $DRUPAL_DB_USER"
echo "DB Port: $DRUPAL_DB_PORT"

echo "=== Testing DB connection ==="
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
  echo "DB connection failed. Error output above."
  echo "Skipping deploy tasks."
fi

exec /opt/docker/bin/entrypoint.sh supervisord
