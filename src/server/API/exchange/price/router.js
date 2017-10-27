"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express'), router = express.Router(), passport = require('passport');
exports.router = router;
const authCtrl = require('../../controllers/authCtrl').exportsObj;
const mongo = require('../../models/db').mongo;
router.get('/isAuth', function (req, res) {
    res.send({ error: false, result: req.isAuthenticated() });
});
router.post('/registerNewUser', (req, res) => {
    console.log('"/registerNewUser" route works');
    authCtrl.registerNewUser(req, res);
});
router.get('/confirmation/:code', (req, res) => {
    console.log('"/confirmation/:code" route works');
    authCtrl.confirmRegistration(req, res);
});
router.post('/sendConfirmationEmailAgain', (req, res) => {
    console.log('"/sendConfirmationEmailAgain" route works');
    authCtrl.sendConfirmationEmailAgain(req, res);
});
router.post('/recovery', (req, res) => {
    console.log('"/recovery" route works');
    authCtrl.resetPasswordInit(req, res);
});
router.post('/reset', (req, res) => {
    console.log('"/reset" route works');
    authCtrl.setNewPassword(req, res);
});
router.post('/logIn', passport.authenticate('username'), (req, res, next) => {
    console.log('"/login" route works');
    authCtrl.signIn(req, res, next);
});
router.post('/logOut', (req, res, next) => {
    console.log('"/logout" route works');
    authCtrl.signOut(req, res, next);
});
/**
 * App routes
 */
router.get('/getUser', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    console.log('"/getUser" route works');
    mongo.getUser(req, res);
});
router.get('/buyPrice', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    res.send(JSON.stringify({ error: false, price: 2500 }));
});
router.post('/buy', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    res.send(JSON.stringify({ error: false }));
});
