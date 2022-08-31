        const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.json')
const axios = require('axios')
module.exports = async (client, message, args) => {
    const userDB = userData.get(message.author.id)
    const count = serverCount.get(message.author.id)
    if(!userDB) return message.reply(":x: You dont have an account created. type `AH!user new` to create one")

    await axios({
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
        let servers = response.data.attributes.relationships.servers.data.map(x => x.attributes.id)

        let msg = await message.reply({embeds: [
            new EmbedBuilder()
            .setTitle(`❓ Are you sure you want to delete your own account!`)
            .setColor(`Red`)
            .setDescription(`You are going to delete your account with username: \`${userDB.username}\`. Once you click the yes button all your ${servers.length > 1 ? '\`'+ servers.length + '\` servers' : 'servers'} will be deleted.\n\n⚠️ *This acction is not reversable. once you deleted your account all your data will be lost forever*`)
        ], components:[
            new ActionRowBuilder()
            .addComponents(
				new ButtonBuilder()
					.setCustomId('DeleteTheAccount')
					.setLabel('Yes')
					.setStyle(ButtonStyle.Success),
			)
            .addComponents(
				new ButtonBuilder()
					.setCustomId('CancelAccountDeletion')
					.setLabel('No')
					.setStyle(ButtonStyle.Danger),
			)
        ]}
        )

        const filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 30000 });
    
        collector.on('collect', async i => {
            i.deferUpdate()
            if(i.customId === "DeleteTheAccount") return collector.stop('DeleteTheAccount')
            if(i.customId === "CancelAccountDeletion") return collector.stop('CancelAccountDeletion')
        })

        collector.on('end', async(a, reason) => {

            msg.edit({
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('DeleteTheAccount')
                            .setLabel('Yes')
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(true)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('CancelAccountDeletion')
                            .setLabel('No')
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true)
                    )
                ]
            })


            if(reason === 'time'){
                msg.edit({
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('DeleteTheAccount')
                                .setLabel('Yes')
                                .setStyle(ButtonStyle.Success)
                                .setDisabled(true)
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('CancelAccountDeletion')
                                .setLabel('No')
                                .setStyle(ButtonStyle.Danger)
                                .setDisabled(true)
                        )
                    ]
                })
                return
            }
            if(reason === 'CancelAccountDeletion'){
                msg.edit({embeds:[
                    new EmbedBuilder()
                    .setTitle(':x: Account Deletion canceled')
                    .setColor(`Red`)
                ]})
                return
            }
            if(reason === 'DeleteTheAccount'){
                
                if(servers.length > 0){
                    await msg.edit({embeds:[
                        new EmbedBuilder()
                        .setTitle('✔ Deleting servers . . .')
                        .setColor(`Red`)
                    ]})
                    await Promise.all(servers.map(async server => {
                        await axios({
                            url: config.pterodactyl.host + "/api/application/servers/" + server + "/force",
                            method: 'DELETE',
                            followRedirect: true,
                            maxRedirects: 5,
                            headers: {
                                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                                'Content-Type': 'application/json',
                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                            }
                        }).then(() => {}).catch(err => {return msg.edit({embeds:[
                            new EmbedBuilder()
                            .setTitle(`:x: There was an error deleting your servers`)
                            .setColor(`Red`)
                        ]})})
                    }))
                }

                await msg.edit({embeds:[
                    new EmbedBuilder()
                    .setTitle('✔ Deleting The Account . . .')
                    .setColor(`Red`)
                ]})

                await axios({
                    url: config.pterodactyl.host + "/api/application/users/" + userDB.consoleID,
                    method: 'DELETE',
                    followRedirect: true,
                    maxRedirects: 5,
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                    }
                }).then(() => {
                    userData.delete(message.author.id)
                    serverCount.set(message.author.id, {
                        used: 0,
                        have: count?.have ?? 0 
                    })


                    msg.edit({
                        embeds:[
                            new EmbedBuilder()
                            .setTitle(`✅ Account Deleted Successfully`)
                            .setColor(`Green`)
                        ]
                    })
                    
                }).catch(err => {
                    msg.edit({
                        embeds:[
                            new EmbedBuilder()
                            .setTitle(`:x: There was an error deleting your account`)
                            .setColor(`Red`)
                            .setDescription(`${err}`)
                        ]
                    })
                })
            }
        })


    }).catch(err=> {
        message.channel.send(`${err}.`)
    })
}
