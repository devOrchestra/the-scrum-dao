let passwordHash = require('password-hash')

import {Collection} from '../../db/mongo/mongo'
import {user} from './schema'
import {log} from '../../service/log'
import {service} from '../../service/service'


class User {
    user: any
    constructor() {
        this.user = new Collection("user", user)
        this.user = this.user.collection
    }

    getUser(username:string) {
        return this.user.findOne({"email.address": username}).then(data => {
            if (data) {
                return data
            } else {
                throw("nodata")
            }
        })
    }
}

export {User}