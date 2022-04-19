const axios = require('axios');
const config = require('../config.json')
const { getKey } = require("./getKey")

const deleteProxy = async (id) => {
    let data
    if(!id) return data

    await axios({
        url: config.nginxPM.host + "/api/nginx/proxy-hosts/" + id,
        method: 'DELETE',
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            'Authorization': await getKey(),
            'Content-Type': 'application/json',
        }
    }).then(res => {
        data = true
    }).catch(err => data = null)

    return data
}

module.exports = {
    deleteProxy
}