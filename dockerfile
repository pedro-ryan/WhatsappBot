FROM node:19-alpine
USER root

WORKDIR /app

ENV TZ=Asia/Calcutta
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python && \
    apk add git

COPY package*.json ./

RUN npm install -g npm@9.3.0 && \
    npm install -g ts-node && \
    npm install -g nodemon && \
    npm install

COPY . .

VOLUME "/app/db"

CMD [ "npm", "run", "start:dock" ]
