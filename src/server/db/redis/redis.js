"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class redlockDemo {
    constructor(some, somelse) {
    }
}
const redis = require('server/db/redis/redis');
const Redlock = require('redlock');
const redisConfig = require('./conig.json');
const config = {
    port: redisConfig.redisPort,
    host: redisConfig.redisHost
};
class Redis {
    constructor() {
        this.client = redis.createClient(config);
    }
    get(field) {
        return new Promise((resolve, reject) => {
            this.client.get(field, (err, data) => {
                try {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                }
                catch (err) {
                    throw new Error(err);
                }
            });
        });
    }
    set(field, value) {
        return new Promise((resolve, reject) => {
            this.client.set(field, value, (err, data) => {
                try {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                }
                catch (err) {
                    throw new Error(err);
                }
            });
        });
    }
    setnx(field, value, expire) {
        return new Promise((resolve, reject) => {
            this.client.set(field, value, (err, data) => {
                if (err) {
                    reject(err);
                }
                else if (data === 'OK') {
                    this.client.expire(field, expire, (err, data) => {
                        resolve(data);
                    });
                }
                else {
                    throw new Error(JSON.stringify(data));
                }
            });
        });
    }
}
exports.Redis = Redis;
class RedlockLocal extends Redlock {
    constructor(client, options = {
            driftFactor: 0.01,
            retryCount: 1000,
            retryDelay: 50,
            retryJitter: 400 // time in ms
        }) {
        super([client], options);
    }
}
exports.Redlock = RedlockLocal;
