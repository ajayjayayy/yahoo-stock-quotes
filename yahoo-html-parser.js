const cheerio = require('cheerio')

let page = null,
    title = null,
    open = 0,
    price = 0  

function YahooHTMLParser(text) {
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

YahooHTMLParser.prototype.price = function() {
    return parseFloat(price.replace(/,/g, ""))
}

YahooHTMLParser.prototype.valid = function() {
    return title && open && price !== 'N/A' && price !== 0.0
}

YahooHTMLParser.prototype.open = function() {
    return parseFloat(open.replace(/,/g, ""))
}

YahooHTMLParser.prototype.volume = function() {
    const volume = page('td[data-test="TD_VOLUME-value"]').text()
    return parseFloat(volume.replace(/,/g, ""))
}

YahooHTMLParser.prototype.cap = function() {
    const cap = page('td[data-test="MARKET_CAP-value"]').text()
    return (cap.replace(/,/g, "") || 'N/A').toUpperCase()
}

YahooHTMLParser.prototype.prev = function() {
    const prev = page('td[data-test="PREV_CLOSE-value"]').text()
    return parseFloat(prev.replace(/,/g, ""))
}

YahooHTMLParser.prototype.change = function() {
    const change = page('#quote-header-info > div:nth-child(3) > div:nth-child(1) > div:nth-child(1) > span:nth-child(2)').text()
    const changeInner = change.substring(change.indexOf('(') + 1, change.indexOf(')') - 1)
    return parseFloat(changeInner.replace(/,/g, ""))
}

YahooHTMLParser.prototype.minMax = function() {
    const dayRange = page('td[data-test="DAYS_RANGE-value"]').text()
    const minMax = dayRange.split(' - ')
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
