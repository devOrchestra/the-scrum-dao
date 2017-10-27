"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("../../../service/log");
const schema_1 = require("../schema");
const mongo_1 = require("../../../db/mongo/mongo");
let userModel = new mongo_1.Collection("user", schema_1.user)['collection'];
const controller = {
    signIn: signIn,
};
exports.controller = controller;
class user {
}
function signIn(req, res, next) {
    return new Promise((resolve, reject) => {
        log_1.log.debug(req.body, 'auth', 1);
        userModel.findOne({ 'email.address': req.body.username }, (error, data) => {
            log_1.log.debug(data, 'auth', 1);
            if (data.email.confirmed === true) {
                req.session.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.cookie('user', req.user.email.address);
                    res.send({
                        error: false,
                        emailConfirmed: true
                    });
                });
            }
            else {
                log_1.log.debug('email is not confirmed', 'auth', 1);
                res.send({ error: false, emailConfirmed: false });
            }
        });
    });
}
