FROM nginx:alpine

# Папка для ключей
RUN mkdir -p /etc/nginx/ssl

RUN apk add --no-cache openssl

# Генерация самоподписанного сертификата
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/server.key \
    -out /etc/nginx/ssl/server.crt \
    -subj "/C=RU/ST=SPB/L=SPB/O=Tetris Game/CN=localhost"

# Даем правильные права на SSL сертификаты
RUN chmod 600 /etc/nginx/ssl/server.key && \
    chmod 644 /etc/nginx/ssl/server.crt

COPY conf/nginx.conf /etc/nginx/nginx.conf

# Копируем файлы игры
COPY *.html *.css *.js /usr/share/nginx/html/

EXPOSE 80 443
