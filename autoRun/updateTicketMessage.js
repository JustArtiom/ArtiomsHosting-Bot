const Discord = require('discord.js');
const config = require('../config.json')
module.exports = async (client) => {
    let channel = client.channels.cache.get(config.channelID.interactionsChannel);
    let msg = (await channel.messages.fetch({limit: 10}))?.last()
    
    let toSendEmbed = [
        new Discord.MessageEmbed()
        .setTitle(`Interactions`)
        .setColor(`BLUE`)
        .setDescription(`📩 - Create a ticket\n💻 - Apply for volunteer developer\n👨‍💼 - Apply staff`)
    ]

    let ToSendComponents = [
        new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
            .setCustomId('CreateTicket')
            .setEmoji('📩')
            .setStyle('SECONDARY')
            .setDisabled(!config.settings.interactions.createTicket)
        )
        .addComponents(
            new Discord.MessageButton()
            .setCustomId('ApplyDeveloper')
            .setEmoji('💻')
            .setStyle('SECONDARY')
            .setDisabled(!config.settings.interactions.developer)
        )
        .addComponents(
            new Discord.MessageButton()
            .setCustomId('ApplyStaff')
            .setEmoji('👨‍💼')
            .setStyle('SECONDARY')
            .setDisabled(!config.settings.interactions.staff)
        )
    ]
    
    if(msg) msg.edit({embeds: toSendEmbed, components: ToSendComponents})
    else channel.send({embeds: toSendEmbed, components: ToSendComponents})
}
