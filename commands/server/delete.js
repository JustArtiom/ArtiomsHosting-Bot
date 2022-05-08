const config = require('../../config.json')
const Discord = require('discord.js');
const axios = require('axios');
module.exports = async (client, message, args) => {
    if(!userData.get(message.author.id)) return message.reply(":x: You dont have an account created. type `AH!user new` to create one")
    if(!args[1]) return message.reply(`:x: What server should i delete? please provide you server id *(AH!server delete <server id>)*`)
    if (args[1].match(/[0-9a-z]+/i) == null)
        return message.channel.send("lol only use english characters.");

    args[1] = args[1].split('-')[0];

    let msg = await message.channel.send('Let me check if this is your server, please wait . . .')

    axios({
        url: config.pterodactyl.host + "/api/application/users/" + userData.get(message.author.id).consoleID + "?include=servers",
        method: 'GET',
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'Application/vnd.pterodactyl.v1+json',
        }
    }).then(async response => {
        const preoutput = response.data.attributes.relationships.servers.data
        const output = await preoutput.find(srv => srv.attributes ? srv.attributes.identifier == args[1] : false)

        if(!output) return msg.edit(`:x: I could not find that server`)
        if (output.attributes.user !== userData.get(message.author.id).consoleID) return msg.edit(`:x: You are not the owner of this server`)

        msg.edit({
            content: `Are you sure you want to delete \`${output.attributes.name}\`? once you delete your server you will never be able to recover it and all data and files will be lost forever!`,
            components:[
                new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('AcceptDelete')
                        .setLabel('Yes')
                        .setStyle('SUCCESS'),
                )
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('RejectDelete')
                        .setLabel('No')
                        .setStyle('DANGER'),
                )
            ]
        })

        const filter = i => i.user.id === message.author.id;
        const Collector = msg.createMessageComponentCollector({ filter, time: 300000 });

        Collector.on('collect', async i => {
            i.deferUpdate()
            Collector.stop()
            if(i.customId === "AcceptDelete") {
                msg.edit({
                    content: `Deleting, please wait . . .`,
                })

                axios({
                    url: config.pterodactyl.host + "/api/application/servers/" + output.attributes.id + "/force",
                    method: 'DELETE',
                    followRedirect: true,
                    maxRedirects: 5,
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                    }
                }).then(() => {
                    msg.edit('Server deleted!')
                    if(!serverCount.get(message.author.id)) return msg.edit('WTF? how did u got a server?')
                    serverCount.subtract(message.author.id + '.used', 1)
                }).catch(err => {
                    msg.edit(`Error: ${err}`)
                })

            }
            if(i.customId === "RejectDelete") {
                msg.edit({
                    content: `Server deletion canceled`,
                })
            }
        })

        Collector.on('end',() => {
            msg.edit({components:[]})
        })
    })  
}