#-------------------------------------
# 2 stage dockerfile for faster builds
#-------------------------------------

# 1. Install Dependancies Stage
FROM node:20-alpine AS dependencies

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --omit=dev

# 2. Build Image Stage
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY --from=dependencies /usr/src/app/node_modules ./node_modules

COPY . .

EXPOSE 3000

# Use CMD so docker-compose can override with a startup chain
CMD [ "node", "api.js" ]

