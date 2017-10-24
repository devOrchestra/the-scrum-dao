import mongoose = require('mongoose');
import Schema = mongoose.Schema;
import {log} from "../../service/log"
const schema = require('./schema.json')

const options = {
    server: {socketOptions: {keepAlive: 1}},
    replset: {socketOptions: {keepAlive: 1}}
};

let connection = mongoose.createConnection(require('./config.json')['connectionString'], options);

class Collection {
    client: any
    collection: any

    constructor(collection:string, schema:object) {
        let connection = mongoose.createConnection(require('./config.json')['connectionString'], options);
        let localSchema = new Schema(schema);
        this.collection = connection.model(collection, localSchema);
    }
}

export {Collection}