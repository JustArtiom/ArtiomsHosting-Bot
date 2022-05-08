const Discord = require('discord.js')
module.exports = {
    name: "help",
    aliases: [''], 
    async run(client, message, args){
        message.reply({embeds:[
            new Discord.MessageEmbed()
            .setTitle(`❓ | Need help?`)
            .setColor(`#677bf9`)
            .addField(`**Pterodactyl commands:**`, `AH!user\nAH!server`, true)
            .addField(`**Info:**`, `AH!ping\nAH!invites\nAH!help`, true)
        ]})
    }
}