const express = require('express')
const fetch = require('node-fetch')
const utils = require('./utils')
const parser = require('./parser')
const app = express();
const cors = require('cors')

const port = 8080;

const apiTiingoToken = utils.readSecret("api_tiingo")
const newsApiToken = utils.readSecret("news_api")

app.use(express.static('angular-stock-app/dist/angular-stock-app'))

app.use(cors())

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + "index.html")
});

app.get('/stock/api/v1.0/outlook/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        res.status(404).send({ 'error': 'invalid ticker' })
    } else {
        const params = { 'token': apiTiingoToken }
        fetch('https://api.tiingo.com/tiingo/daily/' + req.params.ticker + '?' + new URLSearchParams(params))
            .then(apiRes => {
                if (apiRes.status === 200) {
                    return apiRes.json()
                } else {
                    let reasonText = 'GET request for ' + req.params.ticker + ' failed. Reason: ' + apiRes.statusText
                    throw { 'status': apiRes.status, 'reason': reasonText }
                }
            })
            .then(apiJson => parser.parseCompanyOutlook(apiJson))
            .then(parsedRes => res.send(parsedRes))
            .catch(err => {
                res.status(err.status).send({ 'error': err.reason })
            })
    }
});

app.get('/stock/api/v1.0/summary/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        res.status(404).send({ 'error': 'invalid ticker' })
    } else {
        const params = { 'token': apiTiingoToken }
        fetch('https://api.tiingo.com/iex/' + req.params.ticker + '?' + new URLSearchParams(params))
            .then(apiRes => {
                if (apiRes.status === 200) {
                    return apiRes.json()
                } else {
                    let reasonText = 'GET request for ' + req.params.ticker + ' failed. Reason: ' + apiRes.statusText
                    throw { 'status': apiRes.status, 'reason': reasonText }
                }
            })
            .then(apiJson => parser.parseStockSummary(apiJson[0]))
            .then(parsedRes => res.send(parsedRes))
            .catch(err => {
                res.status(err.status).send({ 'error': err.reason })
            })
    }
});

app.get('/stock/api/v1.0/historical/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        res.status(404).send({ 'error': 'invalid ticker' })
    } else {
        if (!('startDate' in req.query)) {
            res.status(404).send({ 'error': 'expected startDate query parameter' })
        } else {
            const params = {
                'startDate': req.query.startDate,
                'token': apiTiingoToken
            }
            fetch('https://api.tiingo.com/tiingo/daily/' + req.params.ticker + '/prices' + '?' + new URLSearchParams(params))
                .then(apiRes => {
                    if (apiRes.status === 200) {
                        return apiRes.json()
                    } else {
                        let reasonText = 'GET request for ' + req.params.ticker + ' failed. Reason: ' + apiRes.statusText
                        throw { 'status': apiRes.status, 'reason': reasonText }
                    }
                })
                .then(apiJson => parser.parseStockInfo(apiJson))
                .then(parsedRes => res.send(parsedRes))
                .catch(err => {
                    res.status(err.status).send({ 'error': err.reason })
                })
        }

    }
});

app.get('/stock/api/v1.0/daily/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        res.status(404).send({ 'error': 'invalid ticker' })
    } else {
        if (!('startDate' in req.query) || !('resampleFreq' in req.query)) {
            res.status(404).send({ 'error': 'expected startDate and resampleFreq query parameter' })
        } else {
            const params = {
                'startDate': req.query.startDate,
                'resampleFreq': req.query.resampleFreq,
                'token': apiTiingoToken
            }
            fetch('https://api.tiingo.com/iex/' + req.params.ticker + '/prices' + '?' + new URLSearchParams(params))
                .then(apiRes => {
                    if (apiRes.status === 200) {
                        return apiRes.json()
                    } else {
                        let reasonText = 'GET request for ' + req.params.ticker + ' failed. Reason: ' + apiRes.statusText
                        throw { 'status': apiRes.status, 'reason': reasonText }
                    }
                })
                .then(apiJson => parser.parseStockInfo(apiJson))
                .then(parsedRes => res.send(parsedRes))
                .catch(err => {
                    res.status(err.status).send({ 'error': err.reason })
                })
        }
    }
});

app.get('/stock/api/v1.0/search', (req, res) => {
    if (!('query' in req.query)) {
        res.status(404).send({ 'error': 'expected "query" query parameter' })
    } else {
        const params = {
            'query': req.query.query,
            'token': apiTiingoToken
        }
        fetch('https://api.tiingo.com/tiingo/utilities/search' + '?' + new URLSearchParams(params))
            .then(apiRes => {
                if (apiRes.status === 200) {
                    return apiRes.json()
                } else {
                    let reasonText = 'GET request for query: ' + req.query.query + ' failed. Reason: ' + apiRes.statusText
                    throw { 'status': apiRes.status, 'reason': reasonText }
                }
            })
            .then(apiJson => parser.parseSearch(apiJson))
            .then(parsedRes => res.send(parsedRes))
            .catch(err => {
                res.status(err.status).send({ 'error': err.reason })
            })
    }
});

app.get('/stock/api/v1.0/news/:ticker', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (!utils.isValidTicker(req.params.ticker)) {
        res.status(404).send({ 'error': 'invalid ticker' })
    } else {
        const params = { 'apiKey': newsApiToken, 'q': req.params.ticker }
        fetch('https://newsapi.org/v2/everything?' + new URLSearchParams(params))
            .then(apiRes => {
                if (apiRes.status === 200) {
                    return apiRes.json()
                } else {
                    let reasonText = 'GET request for ' + req.params.ticker + ' failed. Reason: ' + apiRes.statusText
                    throw { 'status': apiRes.status, 'reason': reasonText }
                }
            })
            .then(apiJson => parser.parseNews(apiJson))
            .then(parsedRes => res.send(parsedRes))
            .catch(err => {
                res.status(err.status).send({ 'error': err.reason })
            })
    }
});

app.listen(port, () => console.log(`Listening on port ${port}...`))