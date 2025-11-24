# Фаза сборки
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm cache clean --force
RUN npm install --legacy-peer-deps

COPY . .
ENV NODE_OPTIONS="--openssl-legacy-provider"
RUN npm run build

# Фаза продакшн
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]