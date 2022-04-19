const Discord = require('discord.js');
module.exports = (client, message, args) => {
    const userDB = userData.get(message.author.id)
    if(!userDB) return message.reply(":x: You dont have an account created. type `AH!user new` to create one")
    
    message.channel.send({embeds:[
        new Discord.MessageEmbed()
        .setColor(`GREEN`)
        .addField(`Username:`, `${userDB.username}`)
        .addField(`Link Date:`, `${userDB.linkDate}`)
        .addField(`Link Time:`, `${userDB.linkTime}`)
    ]})
}