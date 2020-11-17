const utils = require('./utils')

const parseErrorMsg = '[Unable to parse]'

function parseCompanyOutlook(serverResp) {
    const requiredResponse = {}
    if (typeof serverResp === 'object' && !Array.isArray(serverResp)) {
        requiredResponse['parsing'] = true
        requiredResponse['companyName'] = serverResp['name'] || parseErrorMsg
        requiredResponse['stockTickerSymbol'] = serverResp['ticker'] || parseErrorMsg
        requiredResponse['stockExchangeCode'] = serverResp['exchangeCode'] || parseErrorMsg
        requiredResponse['companyStartDate'] = serverResp['startDate'] || parseErrorMsg
        requiredResponse['description'] = serverResp['description'] || parseErrorMsg
    } else {
        requiredResponse['parsing'] = false
    }
    return requiredResponse
}

function parseStockSummary(serverResp) {
    const requiredResponse = {}
    if (typeof serverResp === 'object' && !Array.isArray(serverResp)) {
        requiredResponse['parsing'] = true
        requiredResponse['stockTickerSymbol'] = serverResp['ticker'] || parseErrorMsg
        requiredResponse['timestamp'] = serverResp['timestamp'] || parseErrorMsg
        requiredResponse['lastPrice'] = serverResp['last'] || parseErrorMsg
        requiredResponse['previousClosingPrice'] = serverResp['prevClose'] || parseErrorMsg
        requiredResponse['openingPrice'] = serverResp['open'] || parseErrorMsg
        requiredResponse['highPrice'] = serverResp['high'] || parseErrorMsg
        requiredResponse['lowPrice'] = serverResp['low'] || parseErrorMsg
        requiredResponse['volume'] = serverResp['volume'] || parseErrorMsg

        // only available when market is available
        requiredResponse['bidSize'] = 'bidSize' in serverResp ? serverResp['bidSize'] : parseErrorMsg
        requiredResponse['bidPrice'] = 'bidPrice' in serverResp ? serverResp['bidPrice'] : parseErrorMsg
        requiredResponse['askSize'] = 'askSize' in serverResp ? serverResp['askSize'] : parseErrorMsg
        requiredResponse['askPrice'] = 'askPrice' in serverResp ? serverResp['askPrice'] : parseErrorMsg
            // can be null even when market is open
        requiredResponse['midPrice'] = 'mid' in serverResp ? serverResp['mid'] : parseErrorMsg
    } else {
        requiredResponse['parsing'] = false
    }
    return requiredResponse
}

function parseStockInfo(serverResp) {
    const requiredResponse = {}
    if (Array.isArray(serverResp) && serverResp.length > 0) {
        requiredResponse['parsing'] = true
        requiredResponse['data'] = []
        for (let i = 0; i < serverResp.length; i++) {
            historical_data = {}
            if (serverResp[i]['date'] == null || serverResp[i]['date'] == undefined) {
                continue;
            } else {
                historical_data['date'] = new Date(serverResp[i]['date']).getTime()
            }
            historical_data['open'] = serverResp[i]['open'] || parseErrorMsg
            historical_data['high'] = serverResp[i]['high'] || parseErrorMsg
            historical_data['low'] = serverResp[i]['low'] || parseErrorMsg
            historical_data['close'] = serverResp[i]['close'] || parseErrorMsg
            historical_data['volume'] = serverResp[i]['volume'] || parseErrorMsg
            requiredResponse['data'].push(historical_data)
        }
    } else {
        requiredResponse['parsing'] = false
    }
    return requiredResponse
}

function parseSearch(serverResp) {
    const requiredResponse = {}
    if (Array.isArray(serverResp)) {
        requiredResponse['parsing'] = true
        requiredResponse['data'] = []
        for (let i = 0; i < serverResp.length; i++) {
            if (serverResp[i]['ticker'] != null && serverResp[i]['name'] != null) {
                suggestion = {}
                suggestion['ticker'] = serverResp[i]['ticker']
                suggestion['name'] = serverResp[i]['name']
                requiredResponse['data'].push(suggestion)
            }
        }
    } else {
        requiredResponse['parsing'] = false
    }
    return requiredResponse
}

async function parseNews(serverResp) {
    const requiredResponse = {}
    if (typeof serverResp === 'object' && !Array.isArray(serverResp)) {
        requiredResponse['parsing'] = true
        requiredResponse['articles'] = []
        for (let i = 0; i < serverResp['articles'].length; i++) {
            let successful = await utils.isValidArticle(serverResp['articles'][i])
            if (successful) {
                article = {}
                article['title'] = serverResp['articles'][i]['title']
                article['articleUrl'] = serverResp['articles'][i]['url']
                article['imageUrl'] = serverResp['articles'][i]['urlToImage']
                article['description'] = serverResp['articles'][i]['description']
                article['date'] = serverResp['articles'][i]['publishedAt']
                article['source'] = serverResp['articles'][i]['source']['name']
                requiredResponse['articles'].push(article)
            }
        }
    } else {
        requiredResponse['parsing'] = false
    }
    return requiredResponse
}

module.exports = {
    parseCompanyOutlook: parseCompanyOutlook,
    parseStockSummary: parseStockSummary,
    parseStockInfo: parseStockInfo,
    parseSearch: parseSearch,
    parseNews: parseNews
}