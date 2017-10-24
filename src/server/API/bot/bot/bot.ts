import {bot} from './schema'
import {log} from "../../../service/log"
import {service} from "../../../service/service"
import {Collection} from "../../../db/mongo/mongo"

class Bot {
    collection: any

    constructor() {
        this.collection = new Collection("bot", bot)
        this.collection = this.collection.collection

    }

    add(req: { name: string, strategy: string, username: string }) {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(data => {
                let result = service.checkFields(req, ['name', 'strategy', 'username'])
                if (result.result == true) {
                    return true
                } else {
                    reject({send: true, text: result.info})
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    let bot = new this.collection({
                        username: req.username,
                        name: req.name,
                        strategy: req.strategy
                    })
                    return bot.save()
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    resolve(data)
                }
            }).catch(err => reject(err))
        })
    }

    getList(req: { username: string }) {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(data => {
                return this.collection.find({username: req.username})
            }).then(data => {
                if (typeof data != "undefined") {
                    resolve(data)
                }
            }).catch(err => reject(err))
        })
    }

    setConfig(req: { _id: string, config: any, username: string }) {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(data => {
                let result = service.checkFields(req, ['config', 'username', '_id'])
                if (result.result == true) {
                    return true
                } else {
                    reject({send: true, text: result.info})
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    return this.collection.update(
                        {_id: req._id, username: req.username},
                        {
                            $set: {config: req.config}
                        }
                    )
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    resolve(data)
                }
            }).catch(err => reject(err))
        })
    }

    delete(req: { _id: string, username: string }) {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(data => {
                let result = service.checkFields(req, ['username', '_id'])
                if (result.result == true) {
                    return true
                } else {
                    reject({send: true, text: result.info})
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    return this.collection.deleteOne(
                        {_id: req._id, username: req.username}
                    )
                }
            }).then(data => {
                if (typeof data != "undefined") {
                    resolve(data)
                }
            }).catch(err => reject(err))
        })
    }
}

export {Bot}