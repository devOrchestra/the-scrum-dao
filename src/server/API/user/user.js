"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let passwordHash = require('password-hash');
const mongo_1 = require("../../db/mongo/mongo");
const schema_1 = require("./schema");
class User {
    constructor() {
        this.user = new mongo_1.Collection("user", schema_1.user);
        this.user = this.user.collection;
    }
    getUser(username) {
        return this.user.findOne({ "email.address": username }).then(data => {
            if (data) {
                return data;
            }
            else {
                throw ("nodata");
            }
        });
    }
}
exports.User = User;
