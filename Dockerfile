FROM node:8.9.1
COPY . /src
WORKDIR /src
RUN cd /src && npm install && truffle compile && npm run build-app && npm run build-server
EXPOSE 8021
ENTRYPOINT [ "npm", "start" ]
