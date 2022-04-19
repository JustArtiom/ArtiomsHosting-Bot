const Discord = require('discord.js')
module.exports = async (client, message, args) => {
    if(!serverCount.get(message.author.id)) {
        await serverCount.set(message.author.id, {
            used: 0,
            have: 3
        })
    }

    message.channel.send({
        embeds:[
            new Discord.MessageEmbed()
            .setTitle(`${message.author.username}'s Server Count`)
            .setColor(`#677bf9`)
            .setDescription(`You used \`${serverCount.get(message.author.id).used}/${serverCount.get(message.author.id).have}\` servers`)
        ]
    })
}