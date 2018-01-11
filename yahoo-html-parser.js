const cheerio = require('cheerio')

var page = null,
    title = null,
    open = 0,
    price = 0  

function yahooHTMLParser(text) {
    page = cheerio.load(text)
    title = page("title").text()

    if (!title) {
        return
    }

    open = page('td[data-test="OPEN-value"]').text()
    if (!open) {
        return
    }

    price = page('#quote-header-info > div:nth-child(3) > div:nth-child(1) > div:nth-child(1) > span:nth-child(1)').text()
}

yahooHTMLParser.prototype.price = function() {
    return parseFloat(price.replace(/,/g, ""))
}

yahooHTMLParser.prototype.valid = function() {
    return title && open && price != 'N/A' && price != 0.0
}

yahooHTMLParser.prototype.open = function() {
    return parseFloat(open.replace(/,/g, ""))
}

yahooHTMLParser.prototype.volume = function() {
    var volume = page('td[data-test="TD_VOLUME-value"]').text()
    return parseFloat(volume.replace(/,/g, ""))
}

yahooHTMLParser.prototype.cap = function() {
    var cap = page('td[data-test="MARKET_CAP-value"]').text()
    return (cap.replace(/,/g, "") || 'N/A').toUpperCase()
}

yahooHTMLParser.prototype.prev = function() {
    var prev = page('td[data-test="PREV_CLOSE-value"]').text()
    return parseFloat(prev.replace(/,/g, ""))
}

yahooHTMLParser.prototype.change = function() {
    var change = page('#quote-header-info > div:nth-child(3) > div:nth-child(1) > div:nth-child(1) > span:nth-child(2)').text()
    change = change.substring(change.indexOf('(') + 1, change.indexOf(')') - 1)
    return parseFloat(change.replace(/,/g, ""))
}

yahooHTMLParser.prototype.minMax = function() {
    var dayRange = page('td[data-test="DAYS_RANGE-value"]').text()
    var minMax = dayRange.split(' - ')
    return [minMax.length ? parseFloat(minMax[0].replace(/,/g, "")) : 'N/A', minMax.length ? parseFloat(minMax[1].replace(/,/g, "")) : 'N/A']
}

function parseCap(str) {
    if (str.endsWith("B")) return parseInt(str.substring(0, str.length - 1)) * 1000000000
    if (str.endsWith("M")) return parseInt(str.substring(0, str.length - 1)) * 1000000
    if (str.endsWith("K")) return parseInt(str.substring(0, str.length - 1)) * 1000
    if (str.endsWith("T")) return parseInt(str.substring(0, str.length - 1)) * 1000000000000

    return parseInt(str)
}

module.exports = yahooHTMLParser
