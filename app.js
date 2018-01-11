const logger = require('./logger')

process.on('exit', (code) => {
  logger.info('About to exit with code: %d', code)
}).setUncaughtExceptionCaptureCallback((err) => {
  logger.error('Caught process exception: %s', err.stack)
})

const bodyParser = require("body-parser")
const https = require('https')
const compression = require('compression')

const routes = require('./routes')
const processor = require("./processor")

const app = require("express")()

app.set('view engine', 'jade')

app.locals.moment = require('moment')

app.use(bodyParser.json())
app.use(compression())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/', routes)

const server = app.listen(3000, function () {
    logger.info("Listening on port %s...", server.address().port)
})

// start with updating all stocks
processor.process(true)