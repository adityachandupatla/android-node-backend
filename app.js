const express = require('express')
const utils = require('./utils')
const parser = require('./parser')
const api = require('./api')
const app = express();
const cors = require('cors')

// Listen to the App Engine-specified port, or 8080 otherwise
const port = process.env.PORT || 8080

const apiTiingoToken = utils.readSecret("api_tiingo")
const newsApiToken = utils.readSecret("news_api")

app.use(cors())

function appRoutes() {
    return {
        "outlook": "/stock/api/v1.0/outlook/aapl",
        "summary": "/stock/api/v1.0/summary/aapl",
        "summaryList": "/stock/api/v1.0/summary?tickers=aapl,msft",
        "historical": "/stock/api/v1.0/historical/aapl",
        "autocomplete": "/stock/api/v1.0/search?query=a",
        "news": "/stock/api/v1.0/news/aapl",
        "details": "/stock/api/v1.0/details/aapl"
    }
}

app.get('/stock/api/v1.0/outlook/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        console.log("[ERROR]: invalid ticker: " + req.params.ticker + " at outlook endpoint")
        res.status(404).send(utils.invalidTickerResponse(req.params.ticker));
    } else {
        api.fetchData(
            'https://api.tiingo.com/tiingo/daily/' + req.params.ticker, { 'token': apiTiingoToken },
            parser.parseCompanyOutlook
        ).then(function(preparedResponse) {
            if (preparedResponse.status === 200) {
                let data = preparedResponse.message
                data['sampleEndpoints'] = appRoutes()
                console.log("[SUCCESS]: outlook endpoint returning 200")
                res.send(data)
            } else {
                console.log("[ERROR]: outlook endpoint returning " + preparedResponse.status)
                res.status(preparedResponse.status).send({ 'message': preparedResponse.message })
            }
        })
    }
});

app.get('/stock/api/v1.0/summary/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        console.log("[ERROR]: invalid ticker: " + req.params.ticker + " at summary endpoint")
        res.status(404).send(utils.invalidTickerResponse(req.params.ticker));
    } else {
        api.fetchData(
            'https://api.tiingo.com/iex/' + req.params.ticker, { 'token': apiTiingoToken },
            parser.parseStockSummary
        ).then(function(preparedResponse) {
            if (preparedResponse.status === 200) {
                let data = preparedResponse.message
                data['sampleEndpoints'] = appRoutes()
                console.log("[SUCCESS]: summary endpoint returning 200")
                res.send(data)
            } else {
                console.log("[ERROR]: summary endpoint returning " + preparedResponse.status)
                res.status(preparedResponse.status).send({ 'message': preparedResponse.message })
            }
        })
    }
});

app.get('/stock/api/v1.0/summary', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTickerList(req.query.tickers)) {
        console.log("[ERROR]: invalid ticker list: " + req.query.tickers + " at summary wrapper endpoint")
        res.status(404).send(utils.invalidTickerResponse(req.query.tickers));
    } else {
        api.fetchData(
            'https://api.tiingo.com/iex/', {
                'token': apiTiingoToken,
                'tickers': req.query.tickers
            },
            parser.parseStockSummaryList
        ).then(function(preparedResponse) {
            if (preparedResponse.status === 200) {
                let data = preparedResponse.message
                data['sampleEndpoints'] = appRoutes()
                console.log("[SUCCESS]: summary wrapper endpoint returning 200")
                res.send(data)
            } else {
                console.log("[ERROR]: summary wrapper endpoint returning " + preparedResponse.status)
                res.status(preparedResponse.status).send({ 'message': preparedResponse.message })
            }
        })
    }
});

app.get('/stock/api/v1.0/historical/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        console.log("[ERROR]: invalid ticker: " + req.params.ticker + " at historical endpoint")
        res.status(404).send(utils.invalidTickerResponse(req.params.ticker));
    } else {
        let twoYearAgoDate = utils.formatDate(new Date().setFullYear(new Date().getFullYear() - 2));
        api.fetchData(
            'https://api.tiingo.com/tiingo/daily/' + req.params.ticker + '/prices', {
                'startDate': twoYearAgoDate,
                'token': apiTiingoToken
            },
            parser.parseStockInfo
        ).then(function(preparedResponse) {
            if (preparedResponse.status === 200) {
                let data = preparedResponse.message
                data['sampleEndpoints'] = appRoutes()
                console.log("[SUCCESS]: historical endpoint returning 200")
                res.send(data)
            } else {
                console.log("[ERROR]: historical endpoint returning " + preparedResponse.status)
                res.status(preparedResponse.status).send({ 'message': preparedResponse.message })
            }
        })
    }
});

app.get('/stock/api/v1.0/search', (req, res) => {
    if (!('query' in req.query)) {
        console.log("[ERROR]: invalid ticker: " + req.params.ticker + " at search endpoint")
        res.status(404).send({ 'message': 'expected "query" query parameter' })
    } else {
        api.fetchData(
            'https://api.tiingo.com/tiingo/utilities/search', {
                'query': req.query.query,
                'token': apiTiingoToken
            },
            parser.parseSearch
        ).then(function(preparedResponse) {
            if (preparedResponse.status === 200) {
                let data = preparedResponse.message
                data['sampleEndpoints'] = appRoutes()
                console.log("[SUCCESS]: search endpoint returning 200")
                res.send(data)
            } else {
                console.log("[ERROR]: search endpoint returning " + preparedResponse.status)
                res.status(preparedResponse.status).send({ 'message': preparedResponse.message })
            }
        })
    }
});

app.get('/stock/api/v1.0/news/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        console.log("[ERROR]: invalid ticker: " + req.params.ticker + " at news endpoint")
        res.status(404).send(utils.invalidTickerResponse(req.params.ticker));
    } else {
        api.fetchData(
            'https://newsapi.org/v2/everything', {
                'apiKey': newsApiToken,
                'q': req.params.ticker
            },
            parser.parseNews
        ).then(function(preparedResponse) {
            if (preparedResponse.status === 200) {
                let data = preparedResponse.message
                data['sampleEndpoints'] = appRoutes()
                console.log("[SUCCESS]: news endpoint returning 200")
                res.send(data)
            } else {
                console.log("[ERROR]: news endpoint returning " + preparedResponse.status)
                res.status(preparedResponse.status).send({ 'message': preparedResponse.message })
            }
        })
    }
});

app.get('/stock/api/v1.0/details/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        console.log("[ERROR]: invalid ticker: " + req.params.ticker + " at details endpoint")
        res.status(404).send(utils.invalidTickerResponse(req.params.ticker));
    } else {
        Promise.all([
            api.fetchData(
                'https://api.tiingo.com/tiingo/daily/' + req.params.ticker, { 'token': apiTiingoToken },
                parser.parseCompanyOutlook
            ),
            api.fetchData(
                'https://api.tiingo.com/iex/' + req.params.ticker, { 'token': apiTiingoToken },
                parser.parseStockSummary
            ),
            api.fetchData(
                'https://newsapi.org/v2/everything', {
                    'apiKey': newsApiToken,
                    'q': req.params.ticker
                },
                parser.parseNews
            )
        ]).then(responses => {
            outlookResponse = responses[0]
            summaryResponse = responses[1]
            newsResponse = responses[2]
            cumulativeResponse = {}

            if (outlookResponse.status === 200) {
                cumulativeResponse["outlookModel"] = outlookResponse.message
                console.log("[SUCCESS]: details outlook endpoint returning 200")
            } else {
                console.log("[ERROR]: details outlook endpoint returned " + outlookResponse.status)
            }

            if (summaryResponse.status === 200) {
                cumulativeResponse["summaryModel"] = summaryResponse.message
                console.log("[SUCCESS]: details summary endpoint returning 200")
            } else {
                console.log("[ERROR]: details summary endpoint returned " + summaryResponse.status)
            }

            if (newsResponse.status === 200) {
                cumulativeResponse["newsModel"] = newsResponse.message
                console.log("[SUCCESS]: details news endpoint returning 200")
            } else {
                console.log("[ERROR]: details news endpoint returned " + newsResponse.status)
            }

            cumulativeResponse['sampleEndpoints'] = appRoutes()
            res.send(cumulativeResponse)
        })
    }
});



app.listen(port, () => console.log(`Listening on port ${port}...`))