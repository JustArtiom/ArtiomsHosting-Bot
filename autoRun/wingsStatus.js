const config = require('../config.json')
const Discord = require('discord.js')
const axios = require('axios')
module.exports = async (client) => {
    if(!config.settings.nodeStatus) return

    async function showStats() {
        let panel = true;
        let nodestatus = [];

        await Promise.all(config.nodes.map(async node => {

            let wingscreds = await axios({
                url: config.pterodactyl.host+"/api/application/nodes/" + node.id + "/configuration",
                method: 'GET',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            }).catch(() => {});

            if(!wingscreds) return panel = false

            let servers = (await axios({
                url: config.pterodactyl.host+"/api/application/nodes/" + node.id + "?include=servers",
                method: 'GET',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            }).catch(() => {}))

            if(!servers) return panel = false

            let wingsstatus = await axios({
                url: servers.data.attributes.scheme + '://' + servers.data.attributes.fqdn + ':' + servers.data.attributes.daemon_listen + '/api/system',
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + wingscreds.data.token,
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                }
            }).catch(() => {});

            nodestatus.push({name: node.name, status: wingsstatus?.data ? true : false, servers: servers?.data?.attributes?.relationships?.servers?.data?.length, serverLimit: node.serverLimit})
        }));

        let channel = client.channels.cache.get(config.channelID.nodeStatus)
        let msg = (await channel.messages.fetch({limit: 10})).filter(m => m.author.id === client.user.id).last()

        let embed = new Discord.MessageEmbed()
        .setTitle('ArtiomsHosting Node Status:')
        .setColor(`#677bf9`)
        .setDescription(``
            +`**Node Status:**\n`
            +`Node 1: ${nodestatus.find(x => x.name === 'Node 1')?.status ? '💚 Online' : '❤️ Offline'} (${nodestatus.find(x => x.name === 'Node 1')?.servers}/${nodestatus.find(x => x.name === 'Node 1')?.serverLimit})\n`
            +`Node 2: ${nodestatus.find(x => x.name === 'Node 2')?.status ? '💚 Online' : '❤️ Offline'} (${nodestatus.find(x => x.name === 'Node 2')?.servers}/${nodestatus.find(x => x.name === 'Node 2')?.serverLimit})\n`
            +`\n`
            +`Panel: ${panel ? '💚 Online' : '❤️ Offline'}\n`
            +`\n`
            +`*updating every \`${config.settings.nodeStatusDelay} seconds\`*`
        )
        .setTimestamp()
        .setFooter({text: `Last Time Updated`})

        if(!msg) channel.send({embeds: [embed]})
        else msg.edit({embeds: [embed]})
    }
    setInterval(() => {
        showStats()
    }, config.settings.nodeStatusDelay * 1000)
    showStats()
}