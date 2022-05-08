const Discord = require('discord.js')
module.exports = async (client, message, args) => {
    message.channel.send({embeds:[
        new Discord.MessageEmbed()
        .setTitle(`Here are we commands we have:`)
        .setDescription(`\`AH!staff lockdown\` - change "SEND_MESSAGES" permissions`)
    ]})
}