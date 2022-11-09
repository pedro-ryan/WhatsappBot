FROM node:19-alpine

WORKDIR /app

RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python

COPY package*.json ./

RUN npm install --verbose --legacy-peer-deps

COPY . .

VOLUME "/app/db"

CMD [ "npm", "run", "start:dock" ]
