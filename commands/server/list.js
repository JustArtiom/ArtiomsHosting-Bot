const config = require('../../config.json')
const Discord = require('discord.js');
const axios = require('axios');
module.exports = async (client, message, args) => {
    if(!userData.get(message.author.id)) return message.reply(`:x: You dont have an account yet, run \`AH!user new\` to create one`)

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
        responce = response.data.attributes.relationships.servers.data
        let id = 1
        let id2 = 1

        if(responce.length <= 35){
            message.reply({
                embeds:[
                    new Discord.MessageEmbed()
                    .setTitle(`${message.author.username}'s servers`)
                    .addField('Server Id:', `\`\`\`\n${responce.map(x => `${id++}. ${x.attributes.identifier}`).join('\n')}\`\`\``, true)
                    .addField('Server Name:',`\`\`\`\n${responce.map(x => `${id2++}. ${x.attributes.name}`).join('\n')}\`\`\``, true)
                    .setColor(`GREEN`)
                ]
            }).catch(err => {
                message.reply({
                    embeds:[
                        new Discord.MessageEmbed()
                        .setTitle(`:x: | HOW MANY SERVERS DO U HAVE???`)
                        .setDescription(`${err}`)
                        .setColor(`RED`)
                    ]
                })
            })
        }else{
            let id = 1
            let servers = responce.map(x => `${id++}. ${x.attributes.identifier} ➜ ${x.attributes.name}`).join('\n')
            message.channel.send({
                files:[
                    {
                        attachment: Buffer.from(servers),
                        name: "servers.js"
                    }
                ]
            })
        }
    })
}