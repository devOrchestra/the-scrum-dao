"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("./log");
let service = {
    key: randomKey,
    int: randomInt,
    routeError: routerErrorHandler,
    checkFields: checkFields
};
exports.service = service;
function randomKey(len) {
    let buf = [], chars = 'abcdefghijklmnopqrstuvwxyzQWERTYUIOPASDFGHJKLZXCVBNM0123456789', charlen = chars.length;
    for (let i = 0; i < len; ++i) {
        buf.push(chars[randomInt(0, charlen - 1)]);
    }
    return buf.join('');
}
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function checkFields(req, fields) {
    let result = "";
    let reqFields = Object.keys(req);
    fields.forEach(key => {
        if (!reqFields.includes(key)) {
            result += key + " field required. ";
        }
    });
    if (result.length < 1) {
        return { result: true, info: "" };
    }
    else {
        return { result: false, info: result };
    }
}
// console.log(checkFields({"username":"2","password":2},["username","password"]))
function routerErrorHandler(res, err) {
    log_1.log.error(err, 2, "root", "unexpected");
    log_1.log.debug(process.argv[2]);
    if (process.argv[2] == "debug" || err.send == true) {
        if (err.send == true) {
            res.send({ error: true, status: err.text });
        }
        else {
            res.send({ error: true, status: err });
        }
    }
    else {
        res.send({ error: true, status: "error" });
    }
}
