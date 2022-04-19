module.exports = {
    // name: "buy",
    aliases: [], 
    async execute(client, message, args, Discord){
        return
        //if(!args[0]) return message.channel.send(`Corect command format: \`ah!buy server\``)
        args[0].some(x => x === '1')
        if(args[0] === "server"){
            if(!userServers.get(message.author.id)) return message.channel.send({embeds:[
                new Discord.MessageEmbed()
                .setTitle(`:x: | Error`)
                .setColor(`RED`)
                .setDescription(":x: You dont have an account created. type `AH!user new` to create one")
            ]})
            message.channel.send({embeds:[
                new Discord.MessageEmbed()
                .setColor(`BLUE`)
                .addField(`❗ | Invite Rewards`, `Are you sure you want to sell \`3 invites\` for \`a server\`?`)
                .setFooter(`You have 30 seconds till this embed expires`)
            ]}).then(x => {
                x.react('✅')
                x.react('❌')

                let filter = (reaction, user) => user.id === message.author.id;

                const collector = x.createReactionCollector({ filter, time: 30000, max: 1});

                collector.on('collect', (reaction, user) => {
                    if(!invinfo.get(message.author.id)) return message.channel.send({embeds:[
                        new Discord.MessageEmbed()
                        .setTitle(`:x: | Something went wrong, you dont have invites saved in my database, type ">invites" to fix it`)
                        .setColor("RED")
                    ]})
                    if(reaction.emoji.name === '✅'){

                        if(invinfo.get(message.author.id).invites >= 3){
                            message.channel.send({embeds:[
                                new Discord.MessageEmbed()
                                .setColor("BLUE")
                                .addField(`✅ | Payment succesufuly completed`, `You just bought a **simple** server!`)
                            ]})
                            invinfo.subtract(message.author.id  + '.invites',  3)
                            userServers.add(message.author.id + ".simple.have", 1)
                            invinfo.add(message.author.id + ".sold", 3)
                        }else{
                            message.channel.send({embeds:[
                                new Discord.MessageEmbed()
                                .setTitle(`:x: | You dont have enough invites`)
                                .setColor(`RED`)
                            ]})
                            return
                        }
                    }else{
                        message.channel.send({embeds:[
                            new Discord.MessageEmbed()
                            .setTitle(`:x: | Canceled`)
                            .setColor(`RED`)
                        ]})
                    }
                })
            })
        }
    }
}