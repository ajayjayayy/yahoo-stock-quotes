# yahoo-stock-quotes
Node.js app to get stock quotes from Yahoo. It's fast and robust. Both HTML and REST are avaialble to add/remove symbols.

## Supported features

* REST API provides fast compressed output
* Quotes are kept in memory and periodically saved to the file system
* Log files with daily rotation
* Processing 20 pages / sec on EC2 (t2.micro)
* Suspend processing after the normal trading hours (09.30 - 16.00)

## REST API examples

**Get quotes**\
`GET` /stocks?symbols=AAPL|MSFT|GOOG
```javascript
[  
   {  
      "symbol":"IBM",
      "price":164.27,
      "open":162.91,
      "volume":2541511,
      "cap":"152.08B",
      "change":0.27,
      "min":162.5438,
      "prev":163.83,
      "max":164.33,
      "created":1515549584,
      "updated":1515617828
   },
   {  
      "symbol":"AAPL",
      "price":174.09,
      "open":173.16,
      "volume":21165030,
      "cap":"885.61B",
      "change":-0.14,
      "min":173,
      "prev":174.33,
      "max":174.21,
      "created":1515549584,
      "updated":1515617827
   }
]
```

**Add symbols**\
`POST` `PUT` /stocks
```javascript
["AAPL", "MSFT", "GOOG"]
```

**Remove symbols**\
`DELETE` /stocks
```javascript
["AAPL", "MSFT", "IBM"]
```

**Remove a symbol**\
`DELETE` /stocks/:symbol
