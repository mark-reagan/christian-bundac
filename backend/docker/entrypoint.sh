#!/bin/sh
set -eu

PORT="${PORT:-10000}"

# Render assigns PORT dynamically; make both Apache listeners match it.
sed -i "s/10000/${PORT}/g" /etc/apache2/ports.conf /etc/apache2/sites-available/laravel.conf

mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/testing \
    storage/logs \
    bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

exec apache2-foreground
