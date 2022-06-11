const config = require('../config.json')
const Discord = require('discord.js')
const axios = require('axios')
module.exports = async (client) => {

    let guild = client.guilds.cache.get(config.settings.guildID)

    let MembersCh = client.channels.cache.get(config.voiceID.members)
    let ClientsCh = client.channels.cache.get(config.voiceID.clients)
    let ServersCh = client.channels.cache.get(config.voiceID.servers)

    setInterval(async() => {
        let nodedata 
        nodedata = await axios({
            url: config.pterodactyl.host+"/api/application/nodes/" + config.node.one + "?include=servers,location,allocations",
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).catch(() => nodedata = 'NaN')
        try{
            MembersCh.setName(`🙋 Members: ${guild.members.cache.size}`)
            ClientsCh.setName(`🎓 Clients: ${guild.members.cache.filter(x => x.roles.cache.has(config.roleID.client))?.size}`)
            ServersCh.setName(`📊 Servers: ${nodedata.data.attributes.relationships.servers.data.length ? nodedata.data.attributes.relationships.servers.data.length : nodedata}/700`)
        }catch (err){}
    }, config.settings.vcUpdateInterval * 1000)

    
}