const utils = require('./utils')

const parseErrorMsg = '[Unable to parse]'

function parseJsonData(data, schema) {
    const parsedData = {}
    let errorDesc = ""
    if (typeof data === 'object' && !Array.isArray(data)) {
        parsedData['success'] = true
        for (let i = 0; i < schema.length; i++) {
            let keys = schema[i].key.split(".")
            let obj = data;
            for (let j = 0; j < keys.length; j++) {
                if (obj[keys[j]]) {
                    obj = obj[keys[j]]
                } else {
                    obj = null
                    break
                }
            }
            parsedData[schema[i].mappedKey] = obj
        }
    } else {
        errorDesc = "Expected a json object from the server response"
        parsedData['success'] = false
        parsedData['message'] = errorDesc
    }
    return parsedData
}

function parseCompanyOutlook(serverResp) {
    return parseJsonData(serverResp, [{
            "key": 'name',
            "mappedKey": 'companyName'
        },
        {
            "key": 'ticker',
            "mappedKey": 'stockTickerSymbol'
        },
        {
            "key": 'exchangeCode',
            "mappedKey": 'stockExchangeCode'
        },
        {
            "key": 'startDate',
            "mappedKey": 'companyStartDate'
        },
        {
            "key": 'description',
            "mappedKey": 'description'
        }
    ]);
}

function parseStockSummary(serverResp) {
    if (!Array.isArray(serverResp) || serverResp.length == 0) {
        return { 'success': false, 'message': 'Expected an array (of size > 0) in server response' }
    }
    serverResp = serverResp[0]
    return parseJsonData(serverResp, [{
            "key": 'ticker',
            "mappedKey": 'stockTickerSymbol'
        },
        {
            "key": 'timestamp',
            "mappedKey": 'timestamp'
        },
        {
            "key": 'last',
            "mappedKey": 'lastPrice'
        },
        {
            "key": 'prevClose',
            "mappedKey": 'previousClosingPrice'
        },
        {
            "key": 'open',
            "mappedKey": 'openingPrice'
        },
        {
            "key": 'high',
            "mappedKey": 'highPrice'
        },
        {
            "key": 'low',
            "mappedKey": 'lowPrice'
        },
        {
            "key": 'volume',
            "mappedKey": 'volume'
        },
        {
            "key": 'bidSize',
            "mappedKey": 'bidSize'
        },
        {
            "key": 'bidPrice',
            "mappedKey": 'bidPrice'
        },
        {
            "key": 'askSize',
            "mappedKey": 'askSize'
        },
        {
            "key": 'askPrice',
            "mappedKey": 'askPrice'
        },
        {
            "key": 'mid',
            "mappedKey": 'midPrice'
        },
    ]);
}

function parseStockSummaryList(serverResp) {
    const requiredResponse = {}
    if (Array.isArray(serverResp) && serverResp.length > 0) {
        requiredResponse['success'] = true
        requiredResponse['data'] = []
        for (let i = 0; i < serverResp.length; i++) {
            requiredResponse['data'].push(parseStockSummary([serverResp[i]]))
        }
    } else {
        requiredResponse['success'] = false
        requiredResponse['message'] = 'Expected an array (of size > 0) in server response'
    }
    return requiredResponse
}

function parseStockInfo(serverResp) {
    const requiredResponse = {}
    if (Array.isArray(serverResp) && serverResp.length > 0) {
        requiredResponse['success'] = true
        requiredResponse['data'] = []
        for (let i = 0; i < serverResp.length; i++) {
            let historical_data = parseJsonData(serverResp[i], [{
                    "key": 'date',
                    "mappedKey": 'date'
                },
                {
                    "key": 'open',
                    "mappedKey": 'open'
                },
                {
                    "key": 'high',
                    "mappedKey": 'high'
                },
                {
                    "key": 'low',
                    "mappedKey": 'low'
                },
                {
                    "key": 'close',
                    "mappedKey": 'close'
                },
                {
                    "key": 'volume',
                    "mappedKey": 'volume'
                },
            ]);
            if (!historical_data['date']) {
                continue;
            } else {
                historical_data['date'] = new Date(historical_data['date']).getTime()
            }
            requiredResponse['data'].push(historical_data)
        }
    } else {
        requiredResponse['success'] = false
        requiredResponse['message'] = 'Expected an array (of size > 0) in server response'
    }
    return requiredResponse
}

function parseSearch(serverResp) {
    const requiredResponse = {}
    if (Array.isArray(serverResp) && serverResp.length > 0) {
        requiredResponse['success'] = true
        requiredResponse['data'] = []
        for (let i = 0; i < serverResp.length; i++) {
            if (serverResp[i]['ticker'] && serverResp[i]['name']) {
                suggestion = parseJsonData(serverResp[i], [{
                        "key": 'ticker',
                        "mappedKey": 'ticker'
                    },
                    {
                        "key": 'name',
                        "mappedKey": 'name'
                    }
                ]);
                requiredResponse['data'].push(suggestion)
            }
        }
    } else {
        requiredResponse['success'] = false
        requiredResponse['message'] = 'Expected an array (of size > 0) in server response'
    }
    return requiredResponse
}

function parseNews(serverResp) {
    const requiredResponse = {}
    if (typeof serverResp === 'object' && !Array.isArray(serverResp)) {
        if (Array.isArray(serverResp['articles']) &&
            serverResp['articles'].length > 0) {
            const promises = []
            for (let i = 0; i < serverResp['articles'].length; i++) {
                promises.push(utils.isValidArticle(serverResp['articles'][i]))
            }
            return Promise.all(promises)
                .then(results => {
                    requiredResponse['success'] = true
                    requiredResponse['articles'] = []
                    for (let i = 0; i < results.length; ++i) {
                        if (results[i]) {
                            article = parseJsonData(serverResp['articles'][i], [{
                                    "key": 'title',
                                    "mappedKey": 'title'
                                },
                                {
                                    "key": 'url',
                                    "mappedKey": 'articleUrl'
                                },
                                {
                                    "key": 'urlToImage',
                                    "mappedKey": 'imageUrl'
                                },
                                {
                                    "key": 'description',
                                    "mappedKey": 'description'
                                },
                                {
                                    "key": 'publishedAt',
                                    "mappedKey": 'date'
                                },
                                {
                                    "key": 'source.name',
                                    "mappedKey": 'source'
                                },
                            ]);
                            delete article.success
                            requiredResponse['articles'].push(article)
                        }
                    }
                    return requiredResponse
                })
        } else {
            requiredResponse['success'] = false
            requiredResponse['message'] = 'Expected an array (of size > 0) in server response'
            return requiredResponse
        }
    } else {
        requiredResponse['success'] = false
        requiredResponse['message'] = 'Expected an object in server response'
        return requiredResponse
    }
}

module.exports = {
    parseCompanyOutlook: parseCompanyOutlook,
    parseStockSummary: parseStockSummary,
    parseStockSummaryList: parseStockSummaryList,
    parseStockInfo: parseStockInfo,
    parseSearch: parseSearch,
    parseNews: parseNews
}