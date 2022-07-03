FROM node:16-alpine

WORKDIR /app

COPY . .

RUN npm install
RUN npx tsc

RUN npm prune --production
RUN rm -rf src

CMD [ "npm", "start" ]
