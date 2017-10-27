"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const schema = require('./schema.json');
const options = {
    server: { socketOptions: { keepAlive: 1 } },
    replset: { socketOptions: { keepAlive: 1 } }
};
let connection = mongoose.createConnection(require('./config.json')['connectionString'], options);
class Collection {
    constructor(collection, schema) {
        let connection = mongoose.createConnection(require('./config.json')['connectionString'], options);
        let localSchema = new Schema(schema);
        this.collection = connection.model(collection, localSchema);
    }
}
exports.Collection = Collection;
