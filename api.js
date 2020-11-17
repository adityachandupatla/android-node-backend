const fetch = require('node-fetch')

function fetchData(baseurl, params, parser) {
    let url = baseurl
    if (params) {
        url += '?' + new URLSearchParams(params)
    }
    return fetch(url).then(apiRes => {
            if (apiRes.status === 200) {
                return apiRes.json()
            } else {
                let message = 'GET request ' + url + ' failed. Reason: ' + apiRes.statusText
                throw { 'status': 500, 'message': message }
            }
        })
        .then(apiJson => {
            let parsedRes = parser(apiJson)
            if (!parsedRes) {
                let message = 'Parsing of the response from: ' + url + ' failed.'
                throw { 'status': 500, 'message': message }
            } else {
                return { 'status': 200, 'message': parsedRes }
            }
        })
        .catch(err => {
            console.log(err)
            return err
        })
}

module.exports = {
    fetchData: fetchData
}