'use strict';

const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const http = require('http');

import {log} from './service/log'
import {service} from './service/service'
import {router as authRouter} from './API/user/auth/router'
import {router as settingsRouter} from './API/settings/router'
import {router as botRouter} from './API/bot/router'

const app = express();

/**
 * Default instructions
 */


// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('../app/dist/'))
/**
 * Passport configure
 */

app.use(require('express-session')({
  secret: service.key(20),
  resave: false,
  saveUninitialized: false
}));

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

import {exp as Account}from './API/user/auth/accountModel'
passport.use('username', new LocalStrategy(Account.authenticate()));

passport.use("pin", new LocalStrategy(
    function (deviceID, pin, done) {
        let mobile = new Mobile()
        mobile.collection.findOne({deviceID: deviceID}, function (err, user) {
            try {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (!mobile.checkPin(pin, {pin: user.pin, touch: user.touch})) {
                    return done(null, false);
                }
                var temp = {}
                Object.keys(user).forEach(key=> {
                    temp[key] = user[key]
                })
                temp['email'] = {"address": user.username};
                return done(null, temp);
            } catch (err) {
                log.error(err)
            }
        });
    }));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

/**
 * Routes configure
 */
app.use('/*', express.static('../app/dist/index.html'));
app.use('/api/auth', authRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/bot', botRouter);
app.get('/ping', (req,res)=>{
  console.log("ping")
    res.send("pong")
});

app.use(function(req, res, next) {
    res.status(404).send("Not found")
});

/**
 * Error handler
 */

let port = 8021;
app.set('port', port);
let server = http.createServer(app);
server.listen(port, function () {
    console.log("Express server listening on port "+port);
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