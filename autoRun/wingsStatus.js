const config = require('../config.json')
const Discord = require('discord.js')
const axios = require('axios')
module.exports = async (client) => {
    if(!config.settings.nodeStatus) return

    setInterval(async() => {
        let channel = client.channels.cache.get(config.channelID.nodeStatus)
        let msg = (await channel.messages.fetch({limit: 10})).filter(m => m.author.id === client.user.id).last()

        let panel = ''
        let node1 = ''
        let lavalink = ''
        
        await axios({
            url: config.pterodactyl.host+"/api/application/nodes/" + config.node.one + "?include=servers,location,allocations",
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).then(async node => {
            panel = "🟢 Online"

            await axios({
                url: config.pterodactyl.host + '/api/client/servers/' + "f9dcbdc1" + "/resources",
                method: 'GET',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            }).then(data => {
                node1 = `🟢 Online (${node.data.attributes.relationships.servers.data.length}/600)`
                lavalink = `${data.data.attributes.current_state === 'running' ? `🟢 Online`: data.data.attributes.current_state === 'offline' ? `🔴 Offline` : `🔄 ${data.data.attributes.current_state}`}`
            }).catch(() => {
                lavalink = `🔴 Offline`
                node1 = `🔴 Offline (${node.data.attributes.relationships.servers.data.length}/600)`
            })
            
        }).catch(err => {
            panel = '🔴 Offline'
            node1 = '🔴 Offline'
        })
        

        let embed = [
            new Discord.MessageEmbed()
            .setTitle(`ArtiomsHosting Node Status:`)
            .setDescription(`**Node Status:**\nNode 1: ${node1}\n\nPanel: ${panel}\nLavalink: ${lavalink}\n\n*updating every \`${config.settings.nodeStatusDelay} seconds\`*`)
            .setColor(`#677bf9`)
            .setTimestamp()
            .setFooter({text: `Last Time Updated`})
        ]

        if(!msg) {
            channel.send({embeds: embed})
        }else {
            msg.edit({embeds: embed})
        }

    }, config.settings.nodeStatusDelay * 1000)
}