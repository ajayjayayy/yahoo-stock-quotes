var json = null

function yahooJSONParser(text) {

    var startQuotes = text.indexOf('QuoteSummaryStore')
    if (startQuotes == -1) {
        return
    }

    var startPrice = text.indexOf('"price"')
    if (startPrice == -1) {
        return
    }

    var start = text.indexOf('{', startPrice), end = -1
    var level = 0
    for (var i = start + 1; i < text.length; ++i) {
        if (text.charAt(i) == '{') {
            level += 1
        }

        if (text.charAt(i) == '}') {
            if (level == 0) {
                end = i
                break
            }
            level -= 1
        }
    }

    json = JSON.parse(text.substring(start, end + 1))
}

yahooJSONParser.prototype.valid = function() {
    return json != null && json.regularMarketPrice != null && json.regularMarketChangePercent != null
}

yahooJSONParser.prototype.price = function() {
    return json.regularMarketPrice.raw
}

yahooJSONParser.prototype.open = function() {
    return json.regularMarketOpen.raw
}

yahooJSONParser.prototype.volume = function() {
    return json.regularMarketVolume.raw
}

yahooJSONParser.prototype.cap = function() {
    return json.marketCap.fmt || 'N/A'
}

yahooJSONParser.prototype.prev = function() {
    return json.regularMarketPreviousClose.raw
}

yahooJSONParser.prototype.change = function() {
    return Math.round(json.regularMarketChangePercent.raw * 10000) / 100
}

yahooJSONParser.prototype.minMax = function() {
    return [json.regularMarketDayLow.raw, json.regularMarketDayHigh.raw]
}

module.exports = yahooJSONParser
