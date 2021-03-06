const Discord = require('discord.js');
const config = require('../config.json')
module.exports = async (client) => {
    let channel = client.channels.cache.get(config.channelID.interactionsChannel);
    let msg = (await channel.messages.fetch({limit: 10}))?.last()
    
    let toSendEmbed = [
        new Discord.MessageEmbed()
        .setTitle(`Interactions`)
        .setColor(`BLUE`)
        .setDescription(`š© - Create a ticket\nš» - Apply for volunteer developer\nšØāš¼ - Apply staff`)
    ]

    let ToSendComponents = [
        new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
            .setCustomId('CreateTicket')
            .setEmoji('š©')
            .setStyle('SECONDARY')
            .setDisabled(!config.settings.interactions.createTicket)
        )
        .addComponents(
            new Discord.MessageButton()
            .setCustomId('ApplyDeveloper')
            .setEmoji('š»')
            .setStyle('SECONDARY')
            .setDisabled(!config.settings.interactions.developer)
        )
        .addComponents(
            new Discord.MessageButton()
            .setCustomId('ApplyStaff')
            .setEmoji('šØāš¼')
            .setStyle('SECONDARY')
            .setDisabled(!config.settings.interactions.staff)
        )
    ]
    
    if(msg) msg.edit({embeds: toSendEmbed, components: ToSendComponents})
    else channel.send({embeds: toSendEmbed, components: ToSendComponents})
}
