const config = require('../config.json')
const pinger = require('minecraft-pinger')
const wait = require('node:timers/promises').setTimeout;
const axios = require('axios')
const chalk = require('chalk')
const Discord = require('discord.js')
module.exports = async (client) => {
    if(!config.settings.McScript) return

    async function runeverything () {
        console.log(`${chalk.blue('[ Security ]')}`+" Minecraft Port Checker started :D")
        let data = (await axios({
            url: config.pterodactyl.host+"/api/application/nodes/" + config.node.one + "?include=servers,allocations",
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).catch(() => {return console.log('uhhh- something is happening with the pannel and i cant get information about the servers and allocations')}))?.data.attributes.relationships

        let allocations = data.allocations.data
        let servers = data.servers.data.filter(server => !config.settings.avoidServerPorts.includes(allocations.find(allocation => allocation.attributes.id === server.attributes.allocation)?.attributes.port))

        for(let server of servers){
            await wait(3000)
            let allocation = allocations.find(all => all.attributes.id === server.attributes.allocation)

            let mc = await pinger.pingPromise('172.18.0.1', allocation.attributes.port).catch(()=>{})
            if(mc) {

                let user = (await axios({
                    url: config.pterodactyl.host + "/api/application/users/"+ server.attributes.user,
                    method: 'GET',
                    followRedirect: true,
                    maxRedirects: 5,
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                    }
                }).catch(err => {}))?.data
                console.log(`${chalk.red('[ Security ]')} Minecraft server found on port ${chalk.bold(`${allocation.attributes.port}`)}, Server ID: ${chalk.bold(`${server.attributes.uuid?.split('-')[0]}`)}, Discord ID: ${chalk.bold(`${userData.all().find(x => JSON.parse(x.data).consoleID === user?.attributes.id)}`)}`)
                await client.channels.cache.get(config.channelID.abuse).send({
                    embeds:[
                        new Discord.MessageEmbed()
                        .setTitle(`Minecrafat Server Found!`)
                        .setColor(`RED`)
                        .setDescription(``
                        + `**Server info:**\n`
                        + `Server id: \`${server.attributes.uuid?.split('-')[0]}\`\n`
                        + `Server name: \`${server.attributes.name}\`\n`
                        + `Server port: \`${allocation.attributes.port}\`\n`
                        + `Server domain: \`${allocation.attributes.alias}\`\n`
                        + `\n`
                        + `**Minecraft Stats:**\n`
                        + `Description: \`${mc.description?.text}\`\n`
                        + `Players online: \`${mc.players.online}\`\n`
                        + `Players Max: \`${mc.players.max}\`\n`
                        + `Version: \`${mc.version.name}\`\n`
                        + `Ping: \`${mc.ping} ms\`\n`
                        + `\n`
                        + `**User info:**\n`
                        + `User id: \`${user?.attributes.id}\`\n`
                        + `Username: \`${user?.attributes.username}\`\n`
                        + `Email: \`${user?.attributes.email}\`\n`
                        + `Discord id: \`${userData.all().find(x => JSON.parse(x.data).consoleID === user?.attributes.id)}\``
                        )
                    ]
                })
            }
        }
    }

    runeverything()
    setInterval(() => {
        runeverything()
    }, 21600000)
    
}