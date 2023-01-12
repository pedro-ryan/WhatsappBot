FROM node:19-alpine

WORKDIR /app

RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python

COPY package*.json ./

RUN npm install -g ts-node
RUN npm install --verbose

COPY . .

VOLUME "/app/db"

CMD [ "npm", "run", "start:dock" ]
