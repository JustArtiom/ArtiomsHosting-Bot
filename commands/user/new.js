const { EmbedBuilder } = require('discord.js');
        const axios = require('axios');
        const config = require('../../config.json')
        const wait = require('node:timers/promises').setTimeout;
        const validator = require('validator');
        const moment = require("moment");
        const fs = require('fs');
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        
        
        module.exports = async (client, message, args) => {
        
            if (userData.get(message.author.id)) {
                message.reply(":x: You already have a `panel account` linked to your discord account");
                return;
            }
        
            let getPassword = () => {
                const CAPSNUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
                var password = "";
                while (password.length < 10) {
                    password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
                }
                return password;
            };
        
        
            let category = message.guild.channels.cache.find(c => c.id === config.parentID.createAccount);
            let channel = await message.guild.channels.create(message.author.tag, {
                parent: category.id,
                permissionOverwrites: [{
                    id: message.author.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }, {
                    id: message.guild.id,
                    deny: ['VIEW_CHANNEL']
                }]
            })
            message.reply(`Please check ${channel} to create your account!`)
        
            let msg = await channel.send({
                content: `${message.author}`,
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`Welcome to ArtiomsHosting`)
                    .setColor(`#677bf9`)
                    .setDescription(`In order to continue, please read our terms of serverice and privacy policy that are located [here](https://legal.artiom.host) or in the channel ${client.channels.cache.get(config.channelID.legal)}.\n\nYou are allowed to continue creating your account and use our servicies only if you accept our terms of service and privacy policy\n\nDo you accept our legal?`)
                    .setFooter({text:`This message expires in 5 minutes`})
                ],
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('AcceptLegal')
                            .setLabel('Yes')
                            .setStyle(ButtonStyle.Success),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('RejectLegal')
                            .setLabel('No')
                            .setStyle(ButtonStyle.Danger),
                    )
                ]
            })
        
        
            const filter = i => i.user.id === message.author.id;
            const legalCollector = msg.createMessageComponentCollector({ filter, time: 300000 });
        
            let email
            let username
        
            legalCollector.on('collect', async legalInteraction => {
                legalInteraction.deferUpdate()
                if(legalInteraction.customId === "RejectLegal") return legalCollector.stop('RejectLegal')
                if(legalInteraction.customId === "AcceptLegal") return legalCollector.stop('Success')
            })
        
            legalCollector.on('end', async(a, reason) => {
                if(reason === 'time'){
                    channel.send(':x: Time had expired, I am closing this channel, bye bye :)')
                    await wait(3000)
                    try{ channel.delete() }catch(err){}
                    return
                }
                if(reason === 'RejectLegal'){
                    channel.send(':x: Without accepting our legal, we will now allow you to create an account and use our servicies')
                    await wait(5000)
                    try{ channel.delete() }catch(err){}
                    return
                }
        
                if(reason === 'Success'){
                    const filter = m => m.author.id === message.author.id;
                    const collector = channel.createMessageCollector({ filter, time: 300000 });
        
                    msg.edit({
                        embeds:[
                            new EmbedBuilder()
                            .setTitle(`❓ What is your email adress? (should be valid)`)
                            .setColor(`Yellow`)
                            .setFooter({text:`Type "cancel" to stop the process of creating your account`})
                        ],
                        components: []
                    })
                    
        
                    collector.on('collect', async m => {
                        
                        if(m.content.toLowerCase() === "cancel") return collector.stop("cancelingCreation")
                        try{m.delete()}catch(err){}
        
                        if(!email){
                            if(!validator.isEmail(m.content.toLowerCase().trim())){
                                let tempmsg = await channel.send(':x: The email you send is not valid, try sending again your email...')
                                await wait(1500)
                                tempmsg.delete()
                                return
                            }else{
                                msg.edit({
                                    embeds:[
                                        new EmbedBuilder()
                                        .setTitle(`❓ What your username should be (do not use spaces or special charaters)`)
                                        .setColor(`Yellow`)
                                        .setFooter({text:`Type "cancel" to stop the process of creating your account`})
                                    ],
                                    components: []
                                })
                                email = m.content.toLowerCase().trim()
                            }
                        }else if(!username){
                            if(m.content.trim().split(" ").length > 1) {
                                let tempmsg = await channel.send(':x: The username must not have spaces or special characters, try sending again')
                                await wait(1500)
                                tempmsg.delete()
                                return
                            }else{
                                msg.edit({
                                    embeds:[
                                        new EmbedBuilder()
                                        .setTitle(`⌛ Processing creating your account`)
                                        .setColor(`Yellow`)
                                    ]
                                })
                                username = m.content.toLowerCase().trim()
                                collector.stop("FinishedCreation")
                            }
                        }
                    })
        
                    collector.on('end', async (collected, reason) => {
                        if(reason === 'time'){
                            channel.send(':x: Time had expired, I am closing this channel, bye bye :)')
                            await wait(3000)
                            try{ channel.delete() }catch(err){}
                            return
                        } 
                        if(reason === 'cancelingCreation'){
                            channel.send('Account creation cancelled, deleting channel . . .')
                            await wait(3000)
                            try{ channel.delete() }catch(err){}
                            return
                        } 
        
                        if(reason === 'FinishedCreation'){
                            if(!username || !email) return msg.edit({
                                embeds:[
                                    new EmbedBuilder()
                                    .setTitle(`:x: Something wierd happend...`)
                                    .setColor(`Red`)
                                    .setDescription(`Error: The email or username cache did not save any record! Please contact Artiom#0001 or DIBSTER#2317 for help.`)
                                ]
                            })
        
                            const data = {
                                "username": username.toLowerCase(),
                                "email": email.toLowerCase(),
                                "first_name": username,
                                "last_name": "user",
                                "password": getPassword(),
                                "root_admin": false,
                                "language": "en"
                            }
        
                            axios({
                                url: config.pterodactyl.host + "/api/application/users",
                                method: 'POST',
                                followRedirect: true,
                                maxRedirects: 5,
                                headers: {
                                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                                    'Content-Type': 'application/json',
                                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                                },
                                data: data,
                            }).then(async user => {
                                
                                message.member.roles.add(message.guild.roles.cache.get(config.roleID.client))
                                userData.set(`${message.author.id}`, {
                                    discordID: message.author.id,
                                    consoleID: user.data.attributes.id,
                                    email: user.data.attributes.email,
                                    username: user.data.attributes.username,
                                    linkTime: moment().format("HH:mm:ss"),
                                    linkDate: moment().format("YYYY-MM-DD"),
                                })
                                msg.edit({
                                    content: `${message.author}`,
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle(`✅ Your account was successfully created`)
                                        .setColor(`#677bf9`)
                                        .setDescription(`Here are the account details:\n\n> panel link: ${config.pterodactyl.host}\n> email: \`${email}\`\n> username: \`${username}\`\n> password: || ${data.password} ||\n\nMake sure you will change your password *(after you login)* by accessing the top right account icon on the panel, from there you will have to type your curent password which is marked above and your new password.\n\n⚠️ *This channel will be deleted in 30 minues, make sure you saved your login data before the channel gets deleted*`)
                                    ]
                                })
                                
                                await wait(1800000)
                                try{ channel.delete().catch(() => {}) }catch(err){ msg.channel.send(`There was an error deleting the channel!\n${err}`).catch(err => {})}
                            }).catch(async err => {
                                console.log(err)
                                msg.edit({
                                    embeds:[
                                        new EmbedBuilder()
                                        .setTitle(`:x: Something happend :/`)
                                        .setColor(`Red`)
                                        .setDescription(`There was an error when creating your account\n\n${err.toString() === 'Error: Request failed with status code 422' ? `${err}\n\n> This error is caused of Unprocessable Entity, which can be caused because of many bugs. one of them is using special characters in your username. another example can be that someone already have used that email adress or username.`: err} \n\nerror id: ${Date.now()}`)
                                    ]
                                })
                                channel.send(`This channel will be deleted in 10 seconds . . .`)
                                fs.appendFileSync('./logs/errorCreatingAccount.txt', `\n\n\n${Date.now()} -> ${err}`);
                                await wait(10000)
                                try{ channel.delete() }catch(err){}
                            })
                        }
                    })
                }
            })
        }
