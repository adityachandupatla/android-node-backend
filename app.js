const express = require('express')
const utils = require('./utils')
const parser = require('./parser')
const api = require('./api')
const app = express();
const cors = require('cors')

const port = 8080;

const apiTiingoToken = utils.readSecret("api_tiingo")
const newsApiToken = utils.readSecret("news_api")

app.use(cors())

app.get('/stock/api/v1.0/outlook/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        res.status(404).send(utils.invalidTickerResponse(req.params.ticker));
    } else {
        api.fetchData(
            'https://api.tiingo.com/tiingo/daily/' + req.params.ticker, { 'token': apiTiingoToken },
            parser.parseCompanyOutlook
        );
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
        );
    }
});

app.get('/stock/api/v1.0/historical/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        res.status(404).send(utils.invalidTickerResponse(req.params.ticker));
    } else if (!('startDate' in req.query)) {
        res.status(404).send({ 'message': 'expected startDate query parameter' })
    } else {
        api.fetchData(
            'https://api.tiingo.com/tiingo/daily/' + req.params.ticker + '/prices', {
                'startDate': req.query.startDate,
                'token': apiTiingoToken
            },
            parser.parseStockInfo
        );
    }
});

app.get('/stock/api/v1.0/daily/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        res.status(404).send(utils.invalidTickerResponse(req.params.ticker));
    } else if (!('startDate' in req.query)) {
        res.status(404).send({ 'message': 'expected startDate query parameter' })
    } else if (!('resampleFreq' in req.query)) {
        res.status(404).send({ 'message': 'expected resampleFreq query parameter' })
    } else {
        api.fetchData(
            'https://api.tiingo.com/iex/' + req.params.ticker + '/prices', {
                'startDate': req.query.startDate,
                'resampleFreq': req.query.resampleFreq,
                'token': apiTiingoToken
            },
            parser.parseStockInfo
        );
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
        );
    }
});

app.get('/stock/api/v1.0/news/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        res.status(404).send(utils.invalidTickerResponse(req.params.ticker));
    } else {
        api.fetchData(
            'https://newsapi.org/v2/everything?', {
                'apiKey': newsApiToken,
                'q': req.params.ticker
            },
            parser.parseSearch
        );
    }
});

app.listen(port, () => console.log(`Listening on port ${port}...`))