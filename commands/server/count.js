const Discord = require('discord.js');
module.exports = async (client, message, args) => {
    
    let UserID = args[1] == null ? (message.author.id) : (args[1].match(/[0-9]{18}/).length == 0 ? args[1] : args[1].match(/[0-9]{18}/)[0]);
    let User = await message.guild.members.cache.get(UserID);    

    if(!serverCount.get(UserID)) {
        await serverCount.set(UserID, {
            used: 0,
            have: 3
        });
    };

    message.channel.send({
        embeds:[
            new Discord.MessageEmbed()
            .setTitle(`${User.user.username}'s Server Count:`)
            .setColor(`#677bf9`)
            .setDescription(`You used \`${serverCount.get(message.author.id).used}/${serverCount.get(message.author.id).have}\` servers.`)
        ]
    });
}
