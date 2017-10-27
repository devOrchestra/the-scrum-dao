import winston = require('winston');
import moment = require('moment');

export default new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: process.env.LOG_LEVEL || 'info',
      timestamp: () => { return moment().toISOString() },
      formatter: (options) => {
        return `${options.timestamp()} server ${options.level.toUpperCase()} ${options.message || ''}`
      }
    })
  ]
})
