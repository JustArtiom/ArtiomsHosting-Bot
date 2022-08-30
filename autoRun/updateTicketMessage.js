const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json')
module.exports = async (client) => {
    let channel = client.channels.cache.get(config.channelID.interactionsChannel);
    let msg = (await channel.messages.fetch({limit: 10}))?.last()
    
    let toSendEmbed = [
        new EmbedBuilder()
        .setTitle(`Interactions`)
        .setColor(`BLUE`)
        .setDescription(`📩 - Create a ticket\n💻 - Apply for volunteer developer\n👨‍💼 - Apply staff`)
    ]

    let ToSendComponents = [
        new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('CreateTicket')
            .setEmoji('📩')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!config.settings.interactions.createTicket)
        )
        .addComponents(
            new ButtonBuilder()
            .setCustomId('ApplyDeveloper')
            .setEmoji('💻')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(!config.settings.interactions.developer)
        )
        .addComponents(
            new ButtonBuilder()
            .setCustomId('ApplyStaff')
            .setEmoji('👨‍💼')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(!config.settings.interactions.staff)
        )
    ]
    
    if(msg) msg.edit({ embeds: toSendEmbed, components: ToSendComponents})
    else channel.send({embeds: toSendEmbed, components: ToSendComponents})
}