FROM buildkite/puppeteer:latest

WORKDIR /app

RUN apt-get update \
    && apt-get install python -y

COPY package.json .
COPY package-lock.json .
COPY ./src ./src
COPY ./tokens ./tokens

RUN npm install


ENV PATH="${PATH}:/node_modules/.bin"

CMD [ "npm", "start" ]
