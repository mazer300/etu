FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src/ ./src/
COPY tsconfig.json ./
COPY nest-cli.json ./

# Создаем директорию для данных внутри контейнера
RUN mkdir -p /app/data

RUN npm run build

EXPOSE 3011

CMD ["npm", "run", "start:prod"]