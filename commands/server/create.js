const config = require('../../config.json')
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
module.exports = async (client, message, args) => {
    if (!userData.get(message.author.id)) {
        message.reply(":x: You dont have an account created. type `AH!user new` to create one");
        return;
    }

    if(!args[1] || args[1]?.toLowerCase() === 'list'){  
        
        const panelButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL('https://panel.artiom.host')
        .setLabel("Panel")
        
        const row = new ActionRowBuilder()
        .addComponents([panelButton])
        
        const noTypeListed = new EmbedBuilder() 
            .setTitle(`Types of servers you can create: `)
            .setColor(`#677bf9`)
            .setFooter({text: `example: AH!server create NodeJS Discord Bot`})
            .addFields(
              		{ name: `<:arrow_blue:957264701409087558>**__Discord Bots__**:   `, value: `>>> aio *(all in one)*\nNodeJS\nPython\nJava\nGo\nRedBot`, inline: true },
                            		{ name: `<:arrow_blue:957264701409087558>**__Databases__**:   `, value: `>>> MongoDB\nRedis5\nRedis6\nMariaDB\nPostGres`, inline: true },
              		{ name: `<:arrow_blue:957264701409087558>**__Softwares__**:   `, value: `>>> CodeServer\nHaste\nShareX\nass`, inline: true },
		{ name: `<:arrow_blue:957264701409087558>**__Storage__**:   `, value: `>>> S3`, inline: true },
              		{ name: `<:arrow_blue:957264701409087558>**__Web-Hosting:__**   `, value: `>>> Nginx\nphp`, inline: true }
              )

        message.channel.send({
            content: `> :x: What type of server you want me to create?`,
            embeds: [noTypeListed],
            components: [row]
        })
        return 
    }

    if(!serverCount.get(message.author.id)) {
        serverCount.set(message.author.id, {
            used: 0,
            have: 3
        })
    }else if(serverCount.get(message.author.id).used >= serverCount.get(message.author.id).have) return message.reply(`:x: You tried to create more servers but already used all of them :( , do AH!server count for more info.`)

    let ServerData
    let srvname = args.slice(2).join(' ')

    try{
        ServerData = require(`../../server_creation/${args[1]?.toLowerCase()}.js`)(userData.get(message.author.id).consoleID, srvname ? srvname : args[1], config.settings.serverCreation)
    }catch(err){
        message.reply(`:x: I could no find any server type with the name: \`${args[1]}\`\nType \`AH!server create list\` for more info`)
        return
    }

    let msg = await message.reply(`✅ Creating Server...`)

    axios({
        url: config.pterodactyl.host + "/api/application/servers",
        method: 'POST',
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'Application/vnd.pterodactyl.v1+json',
        },
        data: ServerData,
    }).then(response => {
        
        msg.edit({
            content: null,
            embeds:[
                new EmbedBuilder()
                .setColor(`Green`)
                .setTitle(`✅ Successfully created you a server!`)
                .setDescription(`
                > **Status:** \`${response.statusText}\`
                > **User ID:** \`${userData.get(message.author.id).consoleID}\`
                > **Server Name:** \`${srvname ? srvname : args[1]}\`
                > **Server Type:** \`${args[1].toLowerCase()}\`
                `)
            ]
        })

        serverCount.add(message.author.id + '.used', 1)
            
    }).catch(error => {
        if (error == "Error: Request failed with status code 400") {
            msg.edit({
                content: null,
                embeds:[
                    new EmbedBuilder()
                    .setColor('Red')
	.addFields(
		{ name: '❌ Server creation failed', value: 'The node had ran out of allocations/ports!' }
    )
                ]
            })
        }else if (error == "Error: Request failed with status code 504") {
            msg.edit({
                content: null,
                embeds:[
                    new EmbedBuilder()
                    .setColor('Red')
	.addFields(
		{ name: '❌ Server creation failed', value: 'The node is currently offline or having issues' }
    )
                ]
            })
        }else if (error == "Error: Request failed with status code 429") {
            msg.edit({
                content: null,
                embeds:[
                    new EmbedBuilder()
                    .setColor('Red')
	.addFields(
		{ name: '❌ Server creation failed', value: `Uh oh, This shouldn\'t happen, Try again in a minute or two.` }
                    ]
            })
        }else if (error == "Error: Request failed with status code 429") {
            msg.edit({
                content: null,
                embeds:[
                    new EmbedBuilder()
                    .setColor('Red')
	.addFields(
		{ name: '❌ Server creation failed', value: `Uh oh, This shouldn\'t happen, Try again in a minute or two.` }
                    ]
            })
        }else {
            msg.edit({
                content: null,
                embeds:[
                    new EmbedBuilder()
                    .setColor('Red')
                    .addField(
                      { name: `❌ Server creation failed`, value: `${error}.`)
                ]
            })
        }
    })
    
}
