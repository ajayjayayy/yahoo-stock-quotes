const express = require('express')
const router = express.Router()

const data = require('./data')
const stats = require('./stats')

router.get('/', function(req, res) {
    res.send('Hello World')
})

/* REST API */

router.get('/stocks', function(req, res) {
    const result = []
    const hasDates = req.query.hasDates === 'true'
    req.query.symbols.split('|').forEach(function (symbol) {
        let stock = data.getStock(symbol)
        if (stock && stock.price) {
            if (!hasDates) {
                stock = Object.assign({})
                delete stock.created
                delete stock.updated
            }
        } else if (hasDates) {
            stock = { "symbol":symbol, "created": "N/A" }
        } else {
            stock = { "symbol":symbol }
        }

        result.push(stock)
    })

    res.send(result)
})

function addStocks(symbols) {
    symbols.forEach(function (symbol) {
        data.addStock(symbol)
    })
}

function removeStocks(symbols) {
    symbols.forEach(function (symbol) {
        data.removeStock(symbol)
    })
}

router.post('/stocks', function(req, res) {
    addStocks(req.body.toUpperCase())
    res.send('OK')
})

router.put('/stocks', function(req, res) {
    addStocks(req.body.toUpperCase())
    res.send('OK')
})

router.delete('/stocks', function(req, res) {
    data.removeStocks(req.body.toUpperCase())
    res.send('OK')
})

router.get('/stocks/:symbol', function(req, res) {
    var stock = data.getStock(req.params.symbol.toUpperCase())
    if (!stock) {
        res.status(404).send('Not found')
        return
    }
    stock.invalid = data.isInvalid(stock.symbol)

    res.render('stock', stock)
})

router.delete('/stocks/:symbol', function(req, res) {
    data.removeStocks([req.params.symbol.toUpperCase()])
    res.send('OK')
})

/* Web Pages */

router.get('/manage', function(req, res) {
    var allStocks = data.symbols()
    var invalidStocks = []
    allStocks.forEach(function (symbol) {
        if (data.isInvalid(symbol)) {
            invalidStocks.push(symbol)
        }
    })

    res.render('manage', { allSymbols: data.symbols(), invalidSymbols: data.invalidSymbols(), newSymbols: data.newSymbols(), stats: stats })
})

router.post('/manage/register', function(req, res) {
    addStocks(req.body.stocks.toUpperCase().split(/[\s,]+/))
    res.redirect('/manage')
})

router.post('/manage/unregister', function(req, res) {
    removeStocks(req.body.stocks.toUpperCase().split(/[\s,]+/))
    res.redirect('/manage')
})

router.get('/stats', function(req, res) {

    res.render('stats', { allSymbols: data.symbols(), invalidSymbols: data.invalidSymbols(), newSymbols: data.newSymbols(), stats: stats })
})

module.exports = router