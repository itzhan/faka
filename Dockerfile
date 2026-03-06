FROM php:8.1-apache

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libzip-dev \
    libcurl4-openssl-dev \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# 安装 PHP 扩展
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    gd \
    zip \
    curl \
    bcmath \
    opcache

# 安装 Redis 扩展（用于 session 存储，消除文件锁瓶颈）
RUN pecl install redis && docker-php-ext-enable redis

# 启用 Apache mod_rewrite（伪静态必需）
RUN a2enmod rewrite

# 配置 Apache - 允许 .htaccess 覆盖
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# 设置工作目录
WORKDIR /var/www/html

# 复制项目文件
COPY . /var/www/html/

# 设置目录权限
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 777 /var/www/html/assets 2>/dev/null || true \
    && chmod -R 777 /var/www/html/runtime 2>/dev/null || true \
    && chmod -R 777 /var/www/html/config 2>/dev/null || true

# 删除安装锁文件，确保首次访问进入安装页面
RUN rm -f /var/www/html/kernel/Install/Lock

# PHP 配置优化
RUN echo "upload_max_filesize=64M" > /usr/local/etc/php/conf.d/custom.ini \
    && echo "post_max_size=64M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "memory_limit=256M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "max_execution_time=300" >> /usr/local/etc/php/conf.d/custom.ini

# Session 使用 Redis 存储（替代文件锁，提速 1000%）
RUN echo "session.save_handler = redis" > /usr/local/etc/php/conf.d/session-redis.ini \
    && echo 'session.save_path = "tcp://redis:6379"' >> /usr/local/etc/php/conf.d/session-redis.ini

# 复制并设置启动脚本（修复 volume 挂载后的权限问题）
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
