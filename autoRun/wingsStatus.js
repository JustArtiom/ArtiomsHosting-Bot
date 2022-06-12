const config = require('../config.json');
const Discord = require('discord.js');
const axios = require('axios');
const { ping } = require('ping-tcp-js');
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

            let latency = Date.now();
            await ping(node.domain, node.port).then(() => {
                latency = Date.now() - latency
            }).catch(() => {
                latency = NaN
            })
            
            nodestatus.push({name: node.name, status: wingsstatus?.data ? true : false, servers: servers?.data?.attributes?.relationships?.servers?.data?.length, serverLimit: node.serverLimit, latency: latency})
        }));

        let channel = client.channels.cache.get(config.channelID.nodeStatus)
        let msg = (await channel.messages.fetch({limit: 10})).filter(m => m.author.id === client.user.id).last()
    
        let panellatency = Date.now();
        await ping(config.pterodactyl.host.replace('https://', ''), 80).then(() => {
            panellatency = Date.now() - panellatency
        }).catch(() => {
            panellatency = NaN
        })

        let embed = new Discord.MessageEmbed()
        .setTitle('ArtiomsHosting Node Status:')
        .setColor(`#677bf9`)
        .setDescription(``
            +`**Node Status:**\n`
            +`Node 1: ${nodestatus.find(x => x.name === 'Node 1')?.status ? `${config.node_emoji.online} Online` : `${config.node_emoji.offline} Offline`} (${nodestatus.find(x => x.name === 'Node 1')?.servers}/${nodestatus.find(x => x.name === 'Node 1')?.serverLimit}) [\`${nodestatus.find(x => x.name === 'Node 1').latency}ms\`]\n`
            +`Node 2: ${nodestatus.find(x => x.name === 'Node 2')?.status ? `${config.node_emoji.online} Online` : `${config.node_emoji.offline} Offline`} (${nodestatus.find(x => x.name === 'Node 2')?.servers}/${nodestatus.find(x => x.name === 'Node 2')?.serverLimit}) [\`${nodestatus.find(x => x.name === 'Node 2').latency}ms\`]\n`
            +`\n`
            +`Panel: ${panel ? `💚 Online` : `❤️ Offline`} [\`${panellatency}ms\`]\n`
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