const express = require('express'),
    router = express.Router(),
    passport = require('passport');

import {controller as authController} from './controller'
import {log} from '../../../service/log'
import {service} from '../../../service/service'
import {Mobile} from "./mobile"

router.get('/isAuth', function (req, res) {
    res.send({error: false, result: req.isAuthenticated()});
});


router.post('/logIn', passport.authenticate('username'), (req, res, next) => {
    console.log('BOD', req.body)
    authController.signIn(req, res, next);
});

router.post('/logOut', (req, res, next) => {
    req.logout();
    req.session.save(function (err) {
        res.send({error: false});
    });
});

export {router}
