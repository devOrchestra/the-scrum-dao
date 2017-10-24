import {service} from "../../service/service";
import {Strategy} from "./strategy/strategy"
const express = require('express'),
    router = express.Router(),
    passport = require('passport');


router.post('/getStrategy', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    Promise.resolve().then(data => {
        let strategy = new Strategy()
        return strategy.getStrategyConfig(req.body)
    }).then(data => {
        res.send({error: false, data: data})
    }).catch(err => {
        service.routeError(res, err)
    })
});


export {router}