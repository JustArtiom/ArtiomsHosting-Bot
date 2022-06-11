const config = require('../config.json')
const Discord = require('discord.js')
const axios = require('axios')
module.exports = async (client) => {

    let guild = client.guilds.cache.get(config.settings.guildID)

    let MembersCh = client.channels.cache.get(config.voiceID.members)
    let ClientsCh = client.channels.cache.get(config.voiceID.clients)
    let ServersCh = client.channels.cache.get(config.voiceID.servers)

    async function update() {
        let currentcount = 0
        let maxcount = 0

        config.nodes.map(async ({serverLimit}) => maxcount+=serverLimit)

        await Promise.all(config.nodes.map(async node => {
            let servers = await axios({
                url: config.pterodactyl.host+"/api/application/nodes/" + node.id + "?include=servers",
                method: 'GET',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            }).catch(() => {})

            if(servers) currentcount += servers.data.attributes.relationships.servers.data.length
        }))

        try{
            MembersCh.setName(`🙋 Members: ${guild.members.cache.size}`)
            ClientsCh.setName(`🎓 Clients: ${guild.members.cache.filter(x => x.roles.cache.has(config.roleID.client))?.size}`)
            ServersCh.setName(`📊 Servers: ${currentcount}/${maxcount}`)
        }catch (err){}
    }

    setInterval(() => update(), config.settings.vcUpdateInterval * 1000)
    update()

    
}