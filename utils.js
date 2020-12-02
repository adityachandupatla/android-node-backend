const fs = require('fs')
const fetch = require('node-fetch')

function readSecret(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8')
        return data
    } catch (err) {
        console.log(`Unable to read secret from: ${filename}`)
        console.error(err)
        process.exit(-1)
        return
    }
}

function isValidTicker(ticker) {
    return (typeof ticker === 'string' && ticker.match(/^[a-z0-9]+$/i))
}

function isValidTickerList(tickers) {
    if (typeof tickers === 'string') {
        let tickerList = tickers.split(",")
        for (let ticker in tickerList) {
            if (!isValidTicker(ticker)) {
                return false
            }
        }
        return true
    }
    return false
}

function isValidArticle(article) {
    keys = ['title', 'url', 'urlToImage', 'publishedAt', 'description']
    for (let i = 0; i < keys.length; i++) {
        key = keys[i]
        if ((!(key in article)) || typeof article[key] !== 'string' || article[key] === '') {
            return false
        }
    }

    // check for source property in article object
    if ((!('source' in article)) || typeof article['source'] !== 'object') {
        return false
    }

    // check for name property in source object (nested in article)
    if ((!('name' in article['source'])) || typeof article['source']['name'] !== 'string' || article['source']['name'] === '') {
        return false
    }

    return Promise.all([
        fetch(article['urlToImage']), // check if image url is valid
        fetch(article['url']) // check if article url is valid
    ]).then(responses => {
        for (let i = 0; i < responses.length; ++i) {
            if (responses[i].status !== 200) {
                return Promise.resolve(false)
            }
        }
        return Promise.resolve(true)
    }).catch(error => {
        console.log("Error occurred while validating article: ")
        console.log(article)
        console.log(error)
        return Promise.resolve(false)
    })
}

function invalidTickerResponse(ticker) {
    const message = `ticker: '${ticker}' is invalid ` +
        `please provide a valid ticker. Example: GOOG, AMZN, etc`;
    const error_message = { 'message': message };
    return error_message;
}

function formatDate(date) {
    var d = new Date(date);
    var month = '' + (d.getMonth() + 1);
    var day = '' + d.getDate();
    var year = d.getFullYear();
    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    return [year, month, day].join('-');
}

module.exports = {
    readSecret: readSecret,
    isValidTicker: isValidTicker,
    isValidArticle: isValidArticle,
    isValidTickerList: isValidTickerList,
    invalidTickerResponse: invalidTickerResponse,
    formatDate: formatDate
}