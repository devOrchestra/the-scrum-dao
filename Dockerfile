FROM node:8.9.1
COPY . /src
WORKDIR /src
RUN cd /src
RUN npm install
RUN truffle compile
RUN npm run build-app
RUN npm run build-server
EXPOSE 8021
ENTRYPOINT [ "npm", "start" ]
