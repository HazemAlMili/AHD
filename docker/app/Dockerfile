FROM webdevops/php:8.3-alpine

USER root

WORKDIR /var/www/html

# The base includes curl, GD, mbstring, pdo_mysql, XML, zip, Composer, and PHP-FPM.
COPY laravel-api/composer.json laravel-api/composer.lock ./
RUN composer install \
        --no-interaction \
        --no-progress \
        --prefer-dist \
        --no-scripts \
    && composer clear-cache

COPY laravel-api ./
RUN composer dump-autoload --optimize --no-interaction --no-scripts \
    && mkdir -p storage/app/public storage/app/private storage/framework/cache storage/framework/sessions storage/framework/views storage/logs

COPY docker/app/www.conf /usr/local/etc/php-fpm.d/zz-ahd.conf
COPY docker/app/entrypoint.sh /usr/local/bin/ahd-app-entrypoint
RUN chmod +x /usr/local/bin/ahd-app-entrypoint

EXPOSE 9000

ENTRYPOINT ["ahd-app-entrypoint"]
CMD ["php-fpm", "-F"]
