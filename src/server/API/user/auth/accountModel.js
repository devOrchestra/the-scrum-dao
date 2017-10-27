"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose'), Schema = mongoose.Schema, passportLocalMongoose = require('passport-local-mongoose');
let Account = new Schema({
    email: {
        address: String,
        confirmed: Boolean,
        link: String,
        resetLink: String,
        resetLinkExpire: Number
    },
    password: String
});
mongoose.connect(require("../../../db/mongo/config.json").connectionString);
Account.plugin(passportLocalMongoose, { usernameField: "email.address" });
let exp = mongoose.model('users', Account);
exports.exp = exp;
