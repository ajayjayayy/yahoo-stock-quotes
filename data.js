const logger = require('./logger')
const fs = require('fs')

const config = require('./package.json').config

var modified = false
var invalid = {}
const fileName = 'data.db'

var data = {}
try {
    data = JSON.parse(fs.readFileSync(fileName, 'utf8'))
} catch (err) {
    modified = true
}

function Data() {
}

Data.prototype.getStock = function(symbol) {
    return data[symbol]
}

Data.prototype.addStock = function(symbol) {
    if (!data[symbol]) {
        modified = true
        data[symbol] = {
            symbol: symbol,
            created: Math.floor(Date.now() / 1000)
        }
    }
}

Data.prototype.updateStock = function(stock) {    
    if (data[stock.symbol]) {
        delete invalid[stock.symbol]
        modified = true

        var created = data[stock.symbol].created

        data[stock.symbol] = stock
        data[stock.symbol].created = created
        data[stock.symbol].updated = Math.floor(Date.now() / 1000)
    }
}

Data.prototype.setInvalid = function(symbol) {
    invalid[symbol] = 1
}

Data.prototype.isInvalid = function(symbol) {
    return invalid[symbol] == 1
}

Data.prototype.removeStock = function(symbol) {
    if (data[symbol]) {
        modified = true
        delete data[symbol]
    }
}

Data.prototype.symbols = function() {
    return Object.keys(data)
}

Data.prototype.newSymbols = function() {
    return  Object.values(data).filter(s => s.price == undefined && invalid[s.symbol] == undefined).map(s => s.symbol)
}

Data.prototype.oldSymbols = function() {
    return Object.values(data).filter(s => s.price).map(s => s.symbol)
}

Data.prototype.invalidSymbols = function() {
    return  Object.values(data).filter(s => invalid[s.symbol]).map(s => s.symbol)
}

function saveSecure(fileName, data) {
    fs.writeFile(fileName + '.temp', data, function(err) {
        if (err) {
            throw err
        }
        fs.unlink(fileName, function() {
            fs.rename(fileName + '.temp', fileName, function() {})
        })
    }) 
}

setInterval(function() {
    if (modified) {
        saveSecure(fileName, JSON.stringify(data))
        modified = false
    }
}, config.fileTimeout)

module.exports = new Data()