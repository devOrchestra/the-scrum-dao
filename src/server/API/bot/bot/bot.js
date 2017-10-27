"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("./schema");
const service_1 = require("../../../service/service");
const mongo_1 = require("../../../db/mongo/mongo");
class Bot {
    constructor() {
        this.collection = new mongo_1.Collection("bot", schema_1.bot);
        this.collection = this.collection.collection;
    }
    add(req) {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(data => {
                let result = service_1.service.checkFields(req, ['name', 'strategy', 'username']);
                if (result.result == true) {
                    return true;
                }
                else {
                    reject({ send: true, text: result.info });
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    let bot = new this.collection({
                        username: req.username,
                        name: req.name,
                        strategy: req.strategy
                    });
                    return bot.save();
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    resolve(data);
                }
            }).catch(err => reject(err));
        });
    }
    getList(req) {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(data => {
                return this.collection.find({ username: req.username });
            }).then(data => {
                if (typeof data != "undefined") {
                    resolve(data);
                }
            }).catch(err => reject(err));
        });
    }
    setConfig(req) {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(data => {
                let result = service_1.service.checkFields(req, ['config', 'username', '_id']);
                if (result.result == true) {
                    return true;
                }
                else {
                    reject({ send: true, text: result.info });
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    return this.collection.update({ _id: req._id, username: req.username }, {
                        $set: { config: req.config }
                    });
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    resolve(data);
                }
            }).catch(err => reject(err));
        });
    }
    delete(req) {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(data => {
                let result = service_1.service.checkFields(req, ['username', '_id']);
                if (result.result == true) {
                    return true;
                }
                else {
                    reject({ send: true, text: result.info });
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    return this.collection.deleteOne({ _id: req._id, username: req.username });
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    resolve(data);
                }
            }).catch(err => reject(err));
        });
    }
}
exports.Bot = Bot;
