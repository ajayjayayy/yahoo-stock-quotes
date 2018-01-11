# yahoo-stock-quotes
Node.js app to get stock quotes from Yahoo. It's fast and robust. Both HTML and REST are avaialble to edit symbols to process.

Supported features:

1. REST API provides fast compressed output;
2. Quotes are kept in memory and periodically save to the file system
3. Log files with daily rotation
4. Processing 20 pages / sec on EC2 (t2.micro)
5. Suspend processing after the normal trading hours (09.30 - 16.00)
