"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("../../service/service");
const strategy_1 = require("./strategy/strategy");
const express = require('express'), router = express.Router(), passport = require('passport');
exports.router = router;
router.post('/getStrategy', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    Promise.resolve().then(data => {
        let strategy = new strategy_1.Strategy();
        return strategy.getStrategyConfig(req.body);
    }).then(data => {
        res.send({ error: false, data: data });
    }).catch(err => {
        service_1.service.routeError(res, err);
    });
});
