const winston = require("winston")

require('winston-daily-rotate-file')

const level = process.env.LOG_LEVEL || 'debug';

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: level,
            timestamp: function () {
                return (new Date()).toISOString()
            }
        }),
        new (winston.transports.DailyRotateFile)({
            filename: './logs/log',
            datePattern: 'yyyy-MM-dd.',
            prepend: true,
            level: 'debug'
        })
    ]
})

module.exports = logger
