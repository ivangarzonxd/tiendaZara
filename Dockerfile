FROM php:8.2-apache

# Extensiones PHP necesarias para Symfony 7 y MySQL
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
    pdo \
    pdo_mysql \
    intl \
    zip \
    gd \
    opcache \
    bcmath \
    && a2enmod rewrite deflate expires headers \
    && rm -rf /var/lib/apt/lists/*

# Composer (descarga directa del instalador oficial)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Configuración de Apache para Symfony
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Configuración de Apache AllowOverride
RUN echo '<Directory /var/www/html/public>\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/symfony.conf \
    && a2enconf symfony

# Configuración PHP optimizada
RUN echo "memory_limit=512M" > /usr/local/etc/php/conf.d/symfony.ini \
    && echo "upload_max_filesize=20M" >> /usr/local/etc/php/conf.d/symfony.ini \
    && echo "post_max_size=20M" >> /usr/local/etc/php/conf.d/symfony.ini

# OPcache optimizado para producción
RUN echo "opcache.enable=1" > /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.max_accelerated_files=20000" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.interned_strings_buffer=16" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "realpath_cache_size=4096K" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "realpath_cache_ttl=600" >> /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

EXPOSE 80
