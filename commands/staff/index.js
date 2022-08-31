        const { EmbedBuilder } = require('discord.js')
module.exports = async (client, message, args) => {
const Discord = require('discord.js')
module.exports = async (client, message, args) => {
    message.channel.send({embeds:[
        new EmbedBuilder()
        .setTitle(`Here are we commands we have:`)
        .setDescription(`\`AH!staff lockdown\` - change "SEND_MESSAGES" permissions`)
    ]})
}
    }
