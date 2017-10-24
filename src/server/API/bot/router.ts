import {service} from "../../service/service";
import {Bot} from "./bot/bot"

const express = require('express'),
    router = express.Router(),
    passport = require('passport');


router.post('/get', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    Promise.resolve().then(data => {
        req.body.username = req.user.email.address;
        let bot = new Bot()
        return bot.getList(req.body)
    }).then(data => {
        res.send({error: false, data: data})
    }).catch(err => {
        service.routeError(res, err)
    })
});

router.post('/add', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    Promise.resolve().then(data => {
        req.body.username = req.user.email.address;
        let bot = new Bot()
        return bot.add(req.body)
    }).then(data => {
        res.send({error: false, data: data})
    }).catch(err => {
        service.routeError(res, err)
    })
});

router.post('/setConfig', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    Promise.resolve().then(data => {
        req.body.username = req.user.email.address;
        let bot = new Bot()
        return bot.setConfig(req.body)
    }).then(data => {
        res.send({error: false, data: data})
    }).catch(err => {
        service.routeError(res, err)
    })
});

router.post('/delete', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    Promise.resolve().then(data => {
        req.body.username = req.user.email.address;
        let bot = new Bot()
        return bot.delete(req.body)
    }).then(data => {
        res.send({error: false, data: data})
    }).catch(err => {
        service.routeError(res, err)
    })
});

export {router}