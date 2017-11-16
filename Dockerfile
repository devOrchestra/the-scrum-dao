FROM node:8.9.1
COPY . /src
WORKDIR /src
RUN cd /src && npm install
EXPOSE 8021
ENTRYPOINT [ "npm", "start" ]
