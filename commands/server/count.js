const Discord = require('discord.js');
module.exports = async (client, message, args) => {

    let user = message.mentions.users.first() ? message.mentions.users.first() : client.users.cache.get(args[1]) ? client.users.cache.get(args[1]) : client.users.cache.get(message.author.id);
    if(!user) return message.channel.send(`This should not happend :/`);

    if(!serverCount.get(user.id)) {
        await serverCount.set(user.id, {
            used: 0,
            have: 3
        });
    };

    message.channel.send({
        embeds:[
            new Discord.MessageEmbed()
            .setTitle(`${user.username}'s Server Count`)
            .setColor(`#677bf9`)
            .setDescription(`You used \`${serverCount.get(user.id).used}/${serverCount.get(user.id).have}\` servers.`)
        ]
    });
}