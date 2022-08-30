const config = require('../config.json')

module.exports = async (client, error) => {
    console.log("Error happend: "+error)
    client.channels.cache.get(config.channelID.errorLog).send(''+error+'.')
}