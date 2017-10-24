import {strategy} from './schema'
import {log} from "../../../service/log"
import {service} from "../../../service/service"
import {Collection} from "../../../db/mongo/mongo"

class Strategy {
    collection: any

    constructor() {
        this.collection = new Collection("strategy", strategy)
        this.collection = this.collection.collection

    }

    getStrategyConfig(req) {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(data => {
                let result = service.checkFields(req, ['strategy'])
                if (result.result == true) {
                    return true
                } else {
                    reject({send: true, text: result.info})
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    return this.collection.find({name: req.strategy})
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    resolve(data)
                }
            }).catch(err => reject(err))
        })
    }
}

export {Strategy}