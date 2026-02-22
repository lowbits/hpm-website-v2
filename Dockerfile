# Stage 1: Build theme assets (CSS via Tailwind, JS via Rollup)
FROM node:24-alpine AS theme-build

WORKDIR /theme

# Copy package files first for better layer caching
COPY web/themes/custom/hpm/package.json web/themes/custom/hpm/package-lock.json ./

RUN npm ci

# Copy the full theme — Tailwind's @source directives scan templates for class names
COPY web/themes/custom/hpm/ ./

RUN npm run build


# Stage 2: Production image
FROM webdevops/php-nginx:8.3

ENV WEB_DOCUMENT_ROOT=/app/web

# Copy Composer from official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy composer files first for better layer caching
COPY composer.json composer.lock ./

# Install production dependencies only
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Copy the rest of the application
COPY . .

# Overlay freshly built theme assets from Stage 1
COPY --from=theme-build /theme/css/dist/ web/themes/custom/hpm/css/dist/
COPY --from=theme-build /theme/js/dist/main.js web/themes/custom/hpm/js/dist/main.js
COPY --from=theme-build /theme/js/dist/stage-slider.js web/themes/custom/hpm/js/dist/stage-slider.js

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Ensure files directory exists and set permissions
RUN mkdir -p web/sites/default/files \
    && chown -R application:application web/sites/default/files \
    && chown -R application:application /app

ENTRYPOINT ["/entrypoint.sh"]
