"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("../../service/service");
const bot_1 = require("./bot/bot");
const express = require('express'), router = express.Router(), passport = require('passport');
exports.router = router;
router.post('/get', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    Promise.resolve().then(data => {
        req.body.username = req.user.email.address;
        let bot = new bot_1.Bot();
        return bot.getList(req.body);
    }).then(data => {
        res.send({ error: false, data: data });
    }).catch(err => {
        service_1.service.routeError(res, err);
    });
});
router.post('/add', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    Promise.resolve().then(data => {
        req.body.username = req.user.email.address;
        let bot = new bot_1.Bot();
        return bot.add(req.body);
    }).then(data => {
        res.send({ error: false, data: data });
    }).catch(err => {
        service_1.service.routeError(res, err);
    });
});
router.post('/setConfig', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    Promise.resolve().then(data => {
        req.body.username = req.user.email.address;
        let bot = new bot_1.Bot();
        return bot.setConfig(req.body);
    }).then(data => {
        res.send({ error: false, data: data });
    }).catch(err => {
        service_1.service.routeError(res, err);
    });
});
router.post('/delete', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    Promise.resolve().then(data => {
        req.body.username = req.user.email.address;
        let bot = new bot_1.Bot();
        return bot.delete(req.body);
    }).then(data => {
        res.send({ error: false, data: data });
    }).catch(err => {
        service_1.service.routeError(res, err);
    });
});
