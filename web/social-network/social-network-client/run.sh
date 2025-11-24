#!/bin/bash

#docker-compose down
docker-compose down --rmi all

docker-compose build --no-cache

docker-compose up -d

sleep 5
docker-compose logs