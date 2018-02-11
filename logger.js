const winston = require("winston")
const fs = require("fs")

require('winston-daily-rotate-file')

const level = process.env.LOG_LEVEL || 'debug';

const folder = './logs'
fs.mkdir(folder, function () {
})

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: level,
            colorize: true,
            timestamp: function () {
                return (new Date()).toISOString()
            }
        }),
        new (winston.transports.DailyRotateFile)({
            filename: folder + '/log',
            datePattern: 'yyyy-MM-dd.',
            prepend: true,
            level: 'debug'
        })
    ]
})

module.exports = logger
