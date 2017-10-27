"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express'), router = express.Router(), passport = require('passport');
exports.router = router;
const controller_1 = require("./controller");
router.get('/isAuth', function (req, res) {
    res.send({ error: false, result: req.isAuthenticated() });
});
router.post('/logIn', passport.authenticate('username'), (req, res, next) => {
    console.log('BOD', req.body);
    controller_1.controller.signIn(req, res, next);
});
router.post('/logOut', (req, res, next) => {
    req.logout();
    req.session.save(function (err) {
        res.send({ error: false });
    });
});
