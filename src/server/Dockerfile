FROM node:6.11.2-alpine

ENV HOME=/home/app
WORKDIR $HOME
COPY package.json ./
COPY . ./
RUN npm install -g typescript
RUN npm install
RUN tsc server/app.ts; exit 0

EXPOSE 8021

CMD ["node","server/app"]
