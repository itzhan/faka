#!/bin/bash
set -e

# 确保 runtime 和 assets 目录存在且权限正确（Docker volume 挂载后需要）
mkdir -p /var/www/html/runtime/waf/PACKET
mkdir -p /var/www/html/runtime/compiled
mkdir -p /var/www/html/assets
chown -R www-data:www-data /var/www/html/runtime
chown -R www-data:www-data /var/www/html/assets
chown -R www-data:www-data /var/www/html/config
chmod -R 777 /var/www/html/runtime
chmod -R 777 /var/www/html/assets
chmod -R 777 /var/www/html/config

# 执行原始的 Apache 入口点
exec docker-php-entrypoint "$@"
