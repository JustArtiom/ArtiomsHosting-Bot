const { EmbedBuilder } = require('discord.js');
module.exports = (client, message, args) => {
    const userDB = userData.get(message.author.id)
    if(!userDB) return message.reply(":x: You dont have an account created. type `AH!user new` to create one")
    
    message.channel.send({embeds:
        new EmbedBuilder()
        .setColor(`GREEN`)
        .addFields(
        { name: 'Username:', value: `${userDB.username}`, inline: true },
        { name: 'Link Date:', value: `${userDB.linkDate}`, inline: true },
        { name: 'Link Time:', value: `${userDB.linkTime}`, inline: true },
      )
        })
    
    }