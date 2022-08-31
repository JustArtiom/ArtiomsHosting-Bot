const axios = require('axios')
        const pretty = require('prettysize');
        const format = require('format-duration')
        const { EmbedBuilder } = require('discord.js')
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const config = require('../../config.json')
        module.exports = async (client, message, args) => {
            if(!userData.get(message.author.id)) return message.reply(":x: You dont have an account created. type `AH!user new` to create one")
            args = args.slice(1)
                    let server = args[0]?.split('-')[0]
        
                        if (!server) {
                            let embed = new EmbedBuilder()
                                .setColor(`Green`)
                                .addFields(
                                  { name: '__**Server Status**__', value: 'What server should i display? \nCommand Format: \`AH!server status <server id>\`', inline: true },
                                  )
                            await message.channel.send({embeds:[embed]})
                        } else {
        
                            message.channel.send('Checking server `' + server + '`\nPlease wait, it wont take more that 10 seconds').then((msg) => {
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
                                }).then(response => {
                                    const preoutput = response.data.attributes.relationships.servers.data
                                    const output = preoutput.find(srv => srv.attributes ? srv.attributes.identifier == server : false)
                    
                                    setTimeout(async () => {
                                        if (!output) {
                                            msg.edit(':x: | Sorry but I cannot that server in your list!')
                                        } else {
                
                                            if (output.attributes.user === userData.get(message.author.id).consoleID) {
                                                axios({
                                                    url: config.pterodactyl.host + '/api/client/servers/' + server ,
                                                    method: 'GET',
                                                    followRedirect: true,
                                                    maxRedirects: 5,
                                                    headers: {
                                                        'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                                        'Content-Type': 'application/json',
                                                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                                                    }
                                                }).then(response => {
                                                    axios({
                                                        url: config.pterodactyl.host + '/api/client/servers/' + server + "/resources",
                                                        method: 'GET',
                                                        followRedirect: true,
                                                        maxRedirects: 5,
                                                        headers: {
                                                            'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                                            'Content-Type': 'application/json',
                                                            'Accept': 'Application/vnd.pterodactyl.v1+json',
                                                        }
                                                    }).then(resources => {
                                                        // format(resources.data.attributes.resources.uptime)
                                                        let getUptime = (originalUptime) =>{  
                                                            let filanresult// = format(originalUptime)
                                                            let array = format(originalUptime).split(':')
                                                            let length = array.length
                                                            filanresult = `${array[length - 4] ? `${array[length - 4]}d ` : ""}${array[length - 3] ? `${array[length - 3]}h ` : ""}${array[length - 2] ? `${array[length - 2]}m ` : ""}${array[length - 1] ? `${array[length - 1]}s` : ""}`
                                                            
                                                            return filanresult;
                                                        }
                                    
                                                        let srvname = response.data.attributes.name
                                                        msg.edit({content: "<@" + message.author.id + ">", embeds:[
                                                            new EmbedBuilder()
                                                            .setTitle(`Your Pterodactyl Server Status`)
                                                            .setColor(`${resources.data.attributes.current_state == 'running' ? 'GREEN' : resources.data.attributes.current_state == 'offline' ? 'RED' : "YELLOW"}`)
                                                            .setDescription(`**Status:** \`${resources.data.attributes.current_state == 'running' ? '🟢 Running' : resources.data.attributes.current_state == 'offline' ? '🔴 Offline' : "🔄" + resources.data.attributes.current_state}\`\n`
                                                            + `**Name:** \`${srvname}\`\n`
                                                            + `**Uptime:** \`${getUptime(resources.data.attributes.resources.uptime)}\`\n`
                                                            + `**Cpu:** \`${resources.data.attributes.resources.cpu_absolute}%\`\n`
                                                            + `**Ram:** \`${pretty(resources.data.attributes.resources.memory_bytes)}\`\n`
                                                            + `**Disk:** \`${pretty(resources.data.attributes.resources.disk_bytes)}\`\n`
                                                            + `**Net:** \`⬆️${pretty(resources.data.attributes.resources.network_tx_bytes)}/${pretty(resources.data.attributes.resources.network_rx_bytes)}⬇️\`\n`
                                                            + `**Node:** \`${response.data.attributes.node}\`\n`
                                                            + `**Full Id:** \`${response.data.attributes.uuid}\`\n`
                                                            )
                                                        ], components:[
                                                            new ActionRowBuilder()
                                                            .addComponents(
                                                                new ButtonBuilder()
                                                                .setCustomId('start')
                                                                .setLabel('🟢 Start')
                                                                .setStyle(ButtonStyle.Success),
                                                            )
                                                            .addComponents(
                                                                new ButtonBuilder()
                                                                .setCustomId('restart')
                                                                .setLabel('🔄 Restart')
                                                                .setStyle(ButtonStyle.Primary),
                                                            )
                                                            .addComponents(
                                                                new ButtonBuilder()
                                                                .setCustomId('stop')
                                                                .setLabel('🔴 Stop')
                                                                .setStyle(ButtonStyle.Danger),
                                                            )
                                                            .addComponents(
                                                                new ButtonBuilder()
                                                                .setLabel('🔗 Link')
                                                                .setURL(`https://panel.artiom.host/server/${server}`) //bot didn't update the link
                                                                .setStyle(ButtonStyle.Link),
                                                            )
                                                        ]})
                                                        const filter = m => m.user.id === message.author.id;
                                    
                                                        const collector = msg.createMessageComponentCollector({ filter, max: 1, time: 20000 });
                                    
                                                        collector.on('collect', async i => {
                                                            if(i.customId === "start"){
                                                                axios({
                                                                    url: config.pterodactyl.host + '/api/client/servers/' + server + "/power",
                                                                    method: 'POST',
                                                                    followRedirect: true,
                                                                    maxRedirects: 5,
                                                                    headers: {
                                                                        'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                                                        'Content-Type': 'application/json',
                                                                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                                                                    },
                                                                    data: {
                                                                        "signal": "start"
                                                                    },
                                                                }).then(response => {
                                                                    i.reply(`✅ | server \`${srvname}\` succssufuly started`).then(() => {
                                                                        setTimeout(() => {
                                                                            i.deleteReply()
                                                                        }, 5000)
                                                                    })
                                                                    collector.stop()
                                                                }).catch(err => {
                                                                    msg.edit({embeds:[
                                                                        new EmbedBuilder()
                                                                        .setTitle(`:x: | ${err}`)
                                                                        .setColor('Red')
                                                                    ]})
                                                                })
                                                            }
                                                            if(i.customId === "restart"){
                                                                axios({
                                                                    url: config.pterodactyl.host + '/api/client/servers/' + server + "/power",
                                                                    method: 'POST',
                                                                    followRedirect: true,
                                                                    maxRedirects: 5,
                                                                    headers: {
                                                                        'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                                                        'Content-Type': 'application/json',
                                                                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                                                                    },
                                                                    data: {
                                                                        "signal": "kill"
                                                                    },
                                                                }).then(response => {
                                                                    setTimeout(() => {
                                                                        axios({
                                                                            url: config.pterodactyl.host + '/api/client/servers/' + server + "/power",
                                                                            method: 'POST',
                                                                            followRedirect: true,
                                                                            maxRedirects: 5,
                                                                            headers: {
                                                                                'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                                                                'Content-Type': 'application/json',
                                                                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                                                                            },
                                                                            data: {
                                                                                "signal": "start"
                                                                            },
                                                                        }).then(response => {
                                                                            i.reply(`🔄 | server \`${srvname}\` succssufuly restarted`).then(() => {
                                                                                setTimeout(() => {
                                                                                    i.deleteReply()
                                                                                }, 5000)
                                                                            })
                                                                            collector.stop()
                                                                        }).catch(err => {
                                                                            msg.edit({embeds:[
                                                                                new EmbedBuilder()
                                                                                .setTitle(`:x: | ${err}`)
                                                                                .setColor('Red')
                                                                            ]})
                                                                        })
                                                                    }, 500)
                                                                }).catch(err => {
                                                                    msg.edit({embeds:[
                                                                        new EmbedBuilder()
                                                                        .setTitle(`:x: | ${err}`)
                                                                        .setColor('Red')
                                                                    ]})
                                                                })
                                                            }
                                                            if(i.customId === "stop"){
                                                                axios({
                                                                    url: config.pterodactyl.host + '/api/client/servers/' + server + "/power",
                                                                    method: 'POST',
                                                                    followRedirect: true,
                                                                    maxRedirects: 5,
                                                                    headers: {
                                                                        'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                                                        'Content-Type': 'application/json',
                                                                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                                                                    },
                                                                    data: {
                                                                        "signal": "kill"
                                                                    },
                                                                }).then(response => {
                                                                    i.reply(`🔴 | server \`${srvname}\` succssufuly stopped`).then(() => {
                                                                        setTimeout(() => {
                                                                            i.deleteReply()
                                                                        }, 5000)
                                                                    })
                                                                    collector.stop()
                                                                }).catch(err => {
                                                                    msg.edit({embeds:[
                                                                        new EmbedBuilder()
                                                                        .setTitle(`:x: | ${err}`)
                                                                        .setColor('Red')
                                                                    ]})
                                                                })
                                                            }
                                                        });
                                                        collector.on('end', (collected, reson) => {
                                                            msg.edit({
                                                                components:[
                                                                    new ActionRowBuilder()
                                                                    .addComponents(
                                                                        new ButtonBuilder()
                                                                        .setCustomId('start')
                                                                        .setLabel('🟢 Start')
                                                                        .setStyle(ButtonStyle.Success)
                                                                        .setDisabled(true)
                                                                    )
                                                                    .addComponents(
                                                                        new ButtonBuilder()
                                                                        .setCustomId('restart')
                                                                        .setLabel('🔄 Restart')
                                                                        .setStyle(ButtonStyle.Primary)
                                                                        .setDisabled(true)
                                                                    )
                                                                    .addComponents(
                                                                        new ButtonBuilder()
                                                                        .setCustomId('stop')
                                                                        .setLabel('🔴 Stop')
                                                                        .setStyle(ButtonStyle.Danger)
                                                                        .setDisabled(true)
                                                                    )
                                                                    .addComponents(
                                                                        new ButtonBuilder()
                                                                        .setLabel('🔗 Link')
                                                                        .setURL(`https://panel.artiom.host/server/${server}`)
                                                                        .setStyle(ButtonStyle.Link)
                                                                    )
                                                                ]
                                                            })
                                                        })
                                                    }).catch(err => {
                                                        if(err == 'Error: Request failed with status code 504'){
                                                            msg.edit({embeds:[
                                                                new EmbedBuilder()
                                                                .setTitle(`:x: | ${err}`)
                                                                .setDescription(`The server's node wings or the server might be offline, so i could not access the server`)
                                                                .setColor('Red')
                                                            ]})
                                                        }else{
                                                            msg.edit({embeds:[
                                                                new EmbedBuilder()
                                                                .setTitle(`:x: | ${err}`)
                                                                .setColor('Red')
                                                            ]})
                                                        }
                                                    })
                                                    
                                                }).catch(error => {
                                                    console.log(error + '')
                                                    if(error == 'Error: Request failed with status code 404'){
                                                        msg.edit({embeds:[
                                                            new EmbedBuilder()
                                                            .setTitle(`:x: | The server was not found`)
                                                            .setColor(`Red`)
                                                        ]})
                                                    }else if( error == 'Error: Request failed with status code 403') {
                                                        msg.edit({embeds:[
                                                            new EmbedBuilder()
                                                            .setTitle(`:x: | You are not the owner`)
                                                            .setColor(`Red`)
                                                            .setDescription(`Contact Artiom#0001 on Discord if you encounter this || If you are the owner of this server, that means that the api key that u gave to the bot is invalid.\n \`sv!config\` for remaking the configuration`)
                                                        ]})
                                                    }else{
                                                        msg.edit({embeds:[
                                                            new EmbedBuilder()
                                                            .setTitle(`:x: | ERROR`)
                                                            .setColor(`Red`)
                                                            .setDescription(`.\n${error}`)
                                                        ]})
                                                    }
                                                })
                                            }else{
                                                msg.edit(':x: | Sorry but I cannot find that server in your list!')
                                            }
                                        }
                                    },2000)
                                }).catch(err=> {
                                    msg.edit(`:x: | ${err}`)
                                })
                            })
        
        
                        }
        }
