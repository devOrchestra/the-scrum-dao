"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("./schema");
const service_1 = require("../../../service/service");
const mongo_1 = require("../../../db/mongo/mongo");
class Strategy {
    constructor() {
        this.collection = new mongo_1.Collection("strategy", schema_1.strategy);
        this.collection = this.collection.collection;
    }
    getStrategyConfig(req) {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(data => {
                let result = service_1.service.checkFields(req, ['strategy']);
                if (result.result == true) {
                    return true;
                }
                else {
                    reject({ send: true, text: result.info });
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    return this.collection.find({ name: req.strategy });
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    resolve(data);
                }
            }).catch(err => reject(err));
        });
    }
}
exports.Strategy = Strategy;
