let json = null

function YahooJSONParser(text) {

    const startQuotes = text.indexOf('QuoteSummaryStore')
    if (startQuotes === -1) {
        return
    }

    const startPrice = text.indexOf('"price"')
    if (startPrice === -1) {
        return
    }

    const start = text.indexOf('{', startPrice)
    let end = -1
    let level = 0
    for (let i = start + 1; i < text.length; ++i) {
        if (text.charAt(i) === '{') {
            level += 1
        }

        if (text.charAt(i) === '}') {
            if (level === 0) {
                end = i
                break
            }
            level -= 1
        }
    }

    json = JSON.parse(text.substring(start, end + 1))
}

YahooJSONParser.prototype.valid = function() {
    return json != null && json.regularMarketPrice != null && json.regularMarketChangePercent != null
}

YahooJSONParser.prototype.price = function() {
    return json.regularMarketPrice.raw
}

YahooJSONParser.prototype.open = function() {
    return json.regularMarketOpen.raw
}

YahooJSONParser.prototype.volume = function() {
    return json.regularMarketVolume.raw
}

YahooJSONParser.prototype.cap = function() {
    return (json.marketCap.fmt || 'N/A').toUpperCase()
}

YahooJSONParser.prototype.prev = function() {
    return json.regularMarketPreviousClose.raw
}

YahooJSONParser.prototype.change = function() {
    return Math.round(json.regularMarketChangePercent.raw * 10000) / 100
}

YahooJSONParser.prototype.minMax = function() {
    return [json.regularMarketDayLow.raw, json.regularMarketDayHigh.raw]
}

module.exports = YahooJSONParser
