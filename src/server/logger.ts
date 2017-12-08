import winston = require('winston');
import moment = require('moment');

export default (name: string = 'server'): winston.LoggerInstance => {
  return new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        level: process.env.LOG_LEVEL || 'info',
        timestamp: () => { return moment().toISOString() },
        formatter: (options) => {
          return `${options.timestamp()} ${name} ${options.level.toUpperCase()} ${options.message || ''}`
        },
        stderrLevels: ['error']
      })
    ]
  });
}

