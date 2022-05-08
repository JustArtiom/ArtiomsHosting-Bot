const Discord = require('discord.js');
module.exports = (client, message, args) => {
    message.channel.send({
        embeds:[
            new Discord.MessageEmbed()
            .setTitle(`❓ | Need help?`)
            .setColor(`RED`)
            .setDescription(`\`AH!user new\` - create an account\n\`AH!user delete\` - unlink an account\n\`AH!user link\` - shows info about your account\n\`AH!user password\` - reset your password`)    
        ]
    })
}