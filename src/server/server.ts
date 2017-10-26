'use strict';

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const http = require('http');

const app = express();
/**
 * Default instructions
 */

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('../app/dist/'));

/**
 * Routes configure
 */
app.use('/*', express.static('../app/dist/index.html'));
app.get('/ping', (req, res)=> {
  console.log("ping");
  res.send("pong");
});

app.use(function (req, res, next) {
  res.status(404).send("Not found")
});

app.use(function (error, req, res, next) {
  res.status(500).send(error.message || 'internal error');
});

let port = process.env.SERVER_PORT || 8021;
app.set('port', port);
let server = http.createServer(app);
server.listen(port, function () {
  console.log("Express server listening on port " + port);
});
server.on('error', onError);
server.on('listening', onListening);


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
