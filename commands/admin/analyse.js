const config = require('../../config.json')
const Discord = require('discord.js')
const pretty = require('prettysize');
const axios = require('axios')
const stringTable = require('string-table')
const ms = require('ms')
module.exports = {
    name: "analyse",
    aliases: [''], 
    async run(client, message, args){
        if(!message.member.roles.cache.has(config.roleID.administrator) && message.channel.id !== config.channelID.analyse) return
        if(!args[0]) return message.channel.send(`Are you dumb, or do you have no braincells? chose a number: AH!analyse <ammount to show> <obtional: ram/cpu/disk> `)
        let sortby

        if(args[1]) {
            sortby = args[1].toLowerCase() === 'cpu' ? "CPU" : args[1].toLowerCase() === "ram" ? "RAM" : args[1].toLowerCase() === "disk" ? "DISK" : null
        }

        let msg
        let start = Date.now()
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
        }).then(async ({data}) => {

            msg = await message.reply('Calculating '+data.attributes.relationships.servers.data.length+' servers. . .')

            let done = (await Promise.all(data.attributes.relationships.servers.data.map(x => x.attributes).map(async server => {

                let id = server.identifier
                let name = server.name

                try{
                    let {data: {attributes: {resources}}} = await axios({
                        url: config.pterodactyl.host + '/api/client/servers/' + id + "/resources",
                        method: 'GET',
                        followRedirect: true,
                        maxRedirects: 5,
                        headers: {
                            'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                            'Content-Type': 'application/json',
                            'Accept': 'Application/vnd.pterodactyl.v1+json',
                        }
                    })
                    return {Name: name, ID: id, CPU: resources.cpu_absolute + "%",  RAM: pretty(resources.memory_bytes), Disk: pretty(resources.disk_bytes), resources}
                }catch(err){return {Name: 0, ID: 0, CPU: 0,  RAM: 0, Disk: 0, resources: {memory_bytes: "0"}}}
            }))).sort(function(a, b) {
                return sortby === 'CPU' ? b?.resources?.cpu_absolute - a?.resources?.cpu_absolute : sortby === 'DISK' ? b?.resources?.disk_bytes - a?.resources?.disk_bytes : b?.resources?.memory_bytes - a?.resources?.memory_bytes 
            }).slice(0, args[0])

            msg.edit(`\`\`\`\n${stringTable.create(done)}\`\`\`\ntime taken: ${ms(Date.now() - start)}`).catch(err => {message.reply(`:x: Too Long Message!`)})

        }).catch(x => {msg.edit(`${x}.`)})
    }
}