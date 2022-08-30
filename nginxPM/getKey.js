const axios = require('axios');
const config = require('../config.json')

const getKey = async () => {

    const res = await axios({
        url: `${config.nginxPM.host}/api/tokens`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: {
            "identity": config.nginxPM.email,
            "secret": config.nginxPM.pass
        }
    });

    return `Bearer ${res.data.token}`;
};

module.exports = {
    getKey
};