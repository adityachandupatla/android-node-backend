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
        "historical": "/stock/api/v1.0/historical/aapl",
        "autocomplete": "/stock/api/v1.0/search?query=a",
        "news": "/stock/api/v1.0/news/aapl"
    }
}

app.get('/stock/api/v1.0/outlook/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        res.status(404).send(utils.invalidTickerResponse(req.params.ticker));
    } else {
        api.fetchData(
            'https://api.tiingo.com/tiingo/daily/' + req.params.ticker, { 'token': apiTiingoToken },
            parser.parseCompanyOutlook
        ).then(function(preparedResponse) {
            if (preparedResponse.status === 200) {
                let data = preparedResponse.message
                data['sampleEndpoints'] = appRoutes()
                res.send(data)
            } else {
                res.status(preparedResponse.status).send({ 'message': preparedResponse.message })
            }
        })
    }
});

app.get('/stock/api/v1.0/summary/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        res.status(404).send(utils.invalidTickerResponse(req.params.ticker));
    } else {
        api.fetchData(
            'https://api.tiingo.com/iex/' + req.params.ticker, { 'token': apiTiingoToken },
            parser.parseStockSummary
        ).then(function(preparedResponse) {
            if (preparedResponse.status === 200) {
                let data = preparedResponse.message
                data['sampleEndpoints'] = appRoutes()
                res.send(data)
            } else {
                res.status(preparedResponse.status).send({ 'message': preparedResponse.message })
            }
        })
    }
});

app.get('/stock/api/v1.0/historical/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
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
                res.send(data)
            } else {
                res.status(preparedResponse.status).send({ 'message': preparedResponse.message })
            }
        })
    }
});

app.get('/stock/api/v1.0/search', (req, res) => {
    if (!('query' in req.query)) {
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
                res.send(data)
            } else {
                res.status(preparedResponse.status).send({ 'message': preparedResponse.message })
            }
        })
    }
});

app.get('/stock/api/v1.0/news/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
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
                res.send(data)
            } else {
                res.status(preparedResponse.status).send({ 'message': preparedResponse.message })
            }
        })
    }
});

app.listen(port, () => console.log(`Listening on port ${port}...`))