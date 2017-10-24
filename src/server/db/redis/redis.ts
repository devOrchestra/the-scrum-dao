class redlockDemo {
  constructor(some, somelse) {
  }
}

const redis = require('server/db/redis/redis');
const Redlock = require('redlock') as typeof redlockDemo;
const redisConfig = require('./conig.json');
const config = {
  port: redisConfig.redisPort,
  host: redisConfig.redisHost
};

class Redis {
  client: any

  constructor() {
    this.client = redis.createClient(config)
  }

  get(field): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.get(field, (err, data) => {
        try {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        } catch (err) {
          throw new Error(err)
        }
      })
    })
  }

  set(field, value) {
    return new Promise((resolve, reject) => {
      this.client.set(field, value, (err, data) => {
        try {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        } catch (err) {
          throw new Error(err)
        }
      })
    })
  }

  setnx(field, value, expire) {
    return new Promise((resolve, reject) => {
      this.client.set(field, value, (err, data) => {
        if (err) {
          reject(err)
        } else if (data === 'OK') {
          this.client.expire(field, expire, (err, data) => {
            resolve(data)
          })
        } else {
          throw new Error(JSON.stringify(data))
        }
      })
    })
  }
}

class RedlockLocal extends Redlock {
  this: any;
  constructor(client: any, options = {
    driftFactor: 0.01, // time in ms
    retryCount: 1000,
    retryDelay: 50, // time in ms
    retryJitter: 400 // time in ms
  }) {
    super([client], options);
  }
}

export {Redis as Redis}
export {RedlockLocal as Redlock}
