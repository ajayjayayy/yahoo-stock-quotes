const logger = require('./logger')

const data = require('./data')
const stats = require('./stats')
//const YahooHTMLParser = require('./yahoo-html-parser')
const YahooJSONParser = require('./yahoo-json-parser')

const async = require("async")
const request = require('request')
request.gzip = true

const config = require('./package.json').config

const MARKET_TZ = 'America/New_York'
const MARKET_TIME = '09.30-16.00'
const MARKET_DAYS = ['Monday", "Tuesday', 'Wednesday', 'Thursday', 'Friday']

function Processor() {
}

Processor.processSymbol = function(symbol, callback) {
    const url = 'https://finance.yahoo.com/quote/' + symbol
    loadPage(url, (text) => {

        const parser = new YahooJSONParser(text)

        if (!parser.valid()) {
            callback(null)
            return
        }

        try {
            const minMax = parser.minMax()

            const newStock = {
                symbol: symbol,
                price: parser.price(),
                open: parser.open(),
                volume: parser.volume(),
                cap: parser.cap(),
                change: parser.change(),
                min: minMax[0],
                prev: parser.prev(),
                max: minMax[1]
            }
            callback(newStock)
        } catch(err) {
            logger.error("exception while processing %s %s", symbol, err.stack)
            callback(null)
        }
    }, (err) => {
        logger.error("loadPage error: " + url + "; " + err.message)
        callback(null)
    })
}

Processor.updateStats = function(status, total, timeStarted, successCounter, failedCounter) {
    stats.status = status
    stats.time = Date.now() / 1000 - timeStarted
    stats.total = total || 0
    stats.processed = (successCounter || 0) + (failedCounter || 0)
    stats.success = (successCounter || 0)
    stats.failed = (failedCounter || 0)
    stats.left = stats.total - stats.processed
    stats.RPS = Math.floor(stats.processed / stats.time)
}

Processor.updateStats('Init', 0, Math.floor(Date.now() / 1000))

Processor.processSymbols = function(symbols, callback, it) {
    it = it || 0

    logger.debug('start it %d; stocks %d', it, symbols.length)

    const functions = []

    const timeStarted = Math.floor(Date.now() / 1000)
    let successCounter = 0, failedCounter = 0

    const loggingTask = setInterval(() => {
        logger.debug('req / sec %d; success %d; failed %d', stats.RPS, successCounter, failedCounter)
    }, 10000)

    Processor.updateStats('Processing', symbols.length, timeStarted)

    const failedSymbols = []
    symbols.forEach((symbol) => {
        functions.push((callback) => {
            Processor.processSymbol(symbol, function(stock) {
                if (stock) {
                    data.updateStock(stock)
                    successCounter += 1
                } else {
                    data.setInvalid(symbol)
                    failedCounter += 1
                    failedSymbols.push(symbol)
                }

                Processor.updateStats('Processing', symbols.length, timeStarted, successCounter, failedCounter)

                callback()
            })
        })
    })

    async.parallelLimit(functions,
        config.limit,  // limit
        function() {
            clearInterval(loggingTask)
            logger.debug('finish it %d; success %d; failed %d', it, successCounter, failedCounter)

            Processor.updateStats('Processed', symbols.length, timeStarted, successCounter, failedCounter)

            if (failedSymbols.length > 0 && it < config.repeatNotFound) {
                Processor.processSymbols(failedSymbols, callback, it + 1)
            } else {
                callback()
            }
        });
}

Processor.process = function(force) {
    const newSymbols = data.newSymbols()
    stats.marketOpened = marketOpened()
    if (stats.marketOpened || force) {
        Processor.processSymbols(newSymbols.concat(data.oldSymbols()), function() {
            setTimeout(Processor.process, config.delay)
        })
    } else {
        if (newSymbols.length) {
            Processor.processSymbols(newSymbols, function() {
                setTimeout(Processor.process, config.delay)
            })
        } else {
            setTimeout(Processor.process, 5000)
        }
    }
}

function loadPage(url, success, error) {
    request({ method: 'GET'
        , uri: url
        , gzip: true
    }, (err, response, body) => {
        if (err) {
            error(err)
        } else {
            success(body)
        }
    })
}

function compareTime(first, second) {
    return (first[0] * 60  + first[1]) - (second[0] * 60  + second[1])
}

function marketOpened() {

    const date = new Date()

    const dateOfWeek = date.toLocaleString("en-US", {timeZone: MARKET_TZ, timeZoneName: "short", weekday: 'long'})
    if (!MARKET_DAYS.filter(d => dateOfWeek.startsWith(d)).length) {
        return false
    }

    const from = MARKET_TIME.split('-')[0].split('.')
    const to = MARKET_TIME.split('-')[1].split('.')

    const ifrom = [parseInt(from[0]), parseInt(from[1])]
    const ito = [parseInt(to[0]), parseInt(to[1])]

    const hms = date.toLocaleString("en-US", {timeZone: MARKET_TZ, timeZoneName: "short", hour12: false}).split(" ")[1].split(":")
    const nytime = [parseInt(hms[0]), parseInt(hms[1])]

    return compareTime(nytime, ifrom) >= 0 && compareTime(nytime, ito) <= 0
}

module.exports = Processor