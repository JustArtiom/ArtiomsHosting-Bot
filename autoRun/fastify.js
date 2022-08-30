const config = require('../config.json')
const fastify = require('fastify')()
const axios = require('axios')

fastify.register(require('@fastify/rate-limit'), {
    max: 150,
    timeWindow: '1 minute',
})

fastify.register(require('@fastify/cors'), { origin: '*' });

module.exports = async (client) => {

    fastify.get('/data', async (req, reply) => {
        reply.send({
            members: (await client.guilds.cache.get(config.settings.guildID).members.fetch())?.size,
            clients: userData.all().length,
            servers: (await axios({
                url: config.pterodactyl.host+"/api/application/servers",
                method: 'GET',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            }).catch(() => {}))?.data?.meta?.pagination?.total
        })
    })
      
    if(!config.settings.fastify) return
    fastify.listen(1069, "0.0.0.0", (err, address) => {
        if (err) return console.log(`${require('chalk').red('[ Web Server ]')} Listening to the port`)
        console.log(`${require('chalk').magenta('[ Web Server ]')} Listening to ${address}`);
    })
}