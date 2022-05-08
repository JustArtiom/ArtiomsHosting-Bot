const Discord = require('discord.js')
module.exports = {
    name: "invite",
    aliases: ['invites'], 
    async run(client, message, args){

        if(!invinfo.get(message.author.id)){
            await invinfo.set(message.author.id, {
                invites: 0,
                regular: 0,
                left: 0,
                sold: 0
            })
        }

        message.reply(`**${message.author.username}** have **${invinfo.get(message.author.id).invites}** invites ( **${invinfo.get(message.author.id).regular}** joined, **${invinfo.get(message.author.id).left}** left, **${invinfo.get(message.author.id).sold}** sold)`)
    }
}