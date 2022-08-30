const config = require('../config.json')
const { EmbedBuilder } = require('discord.js')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
module.exports = async (client, interaction) => {
    if(interaction.message.channelId === config.channelID.interactionsChannel && interaction.customId === 'CreateTicket'){
        const guild = interaction.message.guild;
        const {message} = interaction

        const PingChannel = interaction.message.guild.channels.cache.find(channel => channel.name === interaction.user.username.toLowerCase() + '-ticket')
        if(PingChannel) {
            interaction.reply({content:`<@${interaction.user.id}> You already have a ticket, <#${PingChannel.id}>`, ephemeral: true}); 
            PingChannel.send(`${interaction.user} Here is your ticket :)`)
            return
        }

        let role = message.guild.roles.cache.find(r => r.id === config.roleID.staff)

        let channel = await message.guild.channels.create(interaction.user.username+'-ticket', {
            parent: config.parentID.ticketParent,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }, {
                    id: message.guild.id,
                    deny: ['VIEW_CHANNEL']
                }, {
                    id: role,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }
            ]
        })

        const WelcomToTicket = await channel.send({content: `<@${interaction.user.id}>`, embeds:[
            new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Ticket`)
            .setColor(`BLUE`)
            .setDescription(`Welcome to Artiom's Hosting official support, how can we help you?\nPlease describe your problem as much as possible \:D`)
            .setFooter({text:`Please do not ping/ghost ping! | interact with 🔒 to close the ticket`})
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setEmoji('🔒')
                        .setCustomId('CloseTicket')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Secondary),
                )
            ]
        })
        interaction.reply({
            content: `<@${interaction.user.id}> Your ticket had been created, check <#${WelcomToTicket.channel.id}>`,
            ephemeral: true
        })
    }

    if(interaction.message.channelId === config.channelID.interactionsChannel && interaction.customId === 'ApplyDeveloper'){
        const guild = interaction.message.guild;
        const {message} = interaction

        const PingChannel = interaction.message.guild.channels.cache.find(channel => channel.name === interaction.user.username.toLowerCase() + '-dev')
        if(PingChannel) {
            interaction.reply({content:`<@${interaction.user.id}> You already have a channel to apply for dev, <#${PingChannel.id}>`, ephemeral: true}); 
            PingChannel.send(`${interaction.user} Here is your channel, please use it :)`)
            return
        }

        let role = message.guild.roles.cache.find(r => r.id === config.roleID.staff)

        let channel = await message.guild.channels.create(interaction.user.username+'-dev', {
            parent: config.parentID.applyDeveloper,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }, {
                    id: message.guild.id,
                    deny: ['VIEW_CHANNEL']
                }, {
                    id: role,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }
            ]
        })

        const WelcomToTicket = await channel.send({content: `<@${interaction.user.id}>`, embeds:[
            new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Channel`)
            .setColor(`BLUE`)
            .setDescription(`Hi, we are happy to hear that you want to apply for volunteer developing in ArtiomsHosting. Firstly to apply we need to know some informations about you:\n\n> 1. What is your name\n> 2. What is you Contact Email\n> 3. What code languages do you know\n> 4. do you have any projecs that are you proud of?\n> 5. any other details\n\nAt the end please wait untill artiom's responce \\:) ty`)
            .setFooter({text:`Please do not ping/ghost ping! | interact with "🔒" to close the ticket`})
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setEmoji('🔒')
                        .setCustomId('CloseTicket')
                        .setStyle(ButtonStyle.Primary)
                )
            ]
        })
        interaction.reply({
            content: `<@${interaction.user.id}> Your channel had been created, check <#${WelcomToTicket.channel.id}>`,
            ephemeral: true
        })
    }

    if(interaction.message.channelId === config.channelID.interactionsChannel && interaction.customId === 'ApplyStaff'){
        const guild = interaction.message.guild;
        const {message} = interaction

        const PingChannel = interaction.message.guild.channels.cache.find(channel => channel.name === interaction.user.username.toLowerCase() + '-staff')
        if(PingChannel) {
            interaction.reply({content:`<@${interaction.user.id}> You already have a channel to apply for staff, <#${PingChannel.id}>`, ephemeral: true}); 
            PingChannel.send(`${interaction.user} Here is your channel, please use it :)`)
            return
        }

        let role = message.guild.roles.cache.find(r => r.id === config.roleID.administrator)

        let channel = await message.guild.channels.create(interaction.user.username+'-staff', {
            parent: config.parentID.applyStaff,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }, {
                    id: message.guild.id,
                    deny: ['VIEW_CHANNEL']
                }, {
                    id: role,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }
            ]
        })

        const WelcomToTicket = await channel.send({content: `<@${interaction.user.id}>`, embeds:[
            new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Ticket`)
            .setColor(`BLUE`)
            .setDescription(`u sure u want to apply? \:D`)
            .setFooter({text:`Please do not ping/ghost ping! | interact with 🔒 to close the ticket`})
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setEmoji('🔒')
                        .setCustomId('CloseTicket')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Secondary),
                )
            ]
        })
        interaction.reply({
            content: `<@${interaction.user.id}> Your channel had been created, check <#${WelcomToTicket.channel.id}>`,
            ephemeral: true
        })
    }


    if([config.parentID.ticketParent, config.parentID.applyDeveloper, config.parentID.applyStaff].includes(client.channels.cache.get(interaction.message.channelId)?.parentId) && interaction?.customId === 'CloseTicket'){
        interaction.reply(`Closing This Ticket . . .`)
        await wait(1000)
        client.channels.cache.get(interaction.message.channelId)?.delete().catch(() => {})
    }

}