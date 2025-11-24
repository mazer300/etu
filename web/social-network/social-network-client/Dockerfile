FROM node:18-alpine

WORKDIR /app

# Копируем package файлы
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./

# Устанавливаем зависимости
RUN npm install -g @angular/cli@16
RUN npm install

# Копируем исходный код
COPY . .

# Создаем необходимые папки и файлы
RUN mkdir -p src/assets && \
    touch src/favicon.ico && \
    touch src/assets/.gitkeep

# Собираем Angular приложение с увеличенным бюджетом
RUN ng build --configuration production --verbose

EXPOSE 4200 3001

CMD ["npm", "run", "dev"]