const Discord = require('discord.js')
module.exports = {
    name: "snipe",
    aliases: [''], 
    async run(client, message, args){
        let snipe = client.snipes.get(message.channel.id)
        if (!snipe) return message.channel.send(`:x: There is nothing to snipe`)

        snipe = [...snipe.values()]
        snipe.reverse();

        let number = 0;

        if (!args[0]) number = 0;
        else number = (parseInt(args[0]) - 1);

        if (number >= snipe.length) number = snipe.length - 1;
        if (number < 0) number = 0;

        let snipedMessage = snipe[number];

        message.channel.send({
            embeds: [
                new Discord.MessageEmbed()
                .setTitle(`Message ${snipedMessage.action} by ${snipedMessage.member.user.tag}`)
                .setDescription(snipedMessage.message ? "`" + snipedMessage.message + "`" : "ㅤ")
                .setImage(snipedMessage.image)
                .setFooter({text: `${number + 1}/${snipe.length}  -  Edited at`})
                .setTimestamp(snipedMessage.timestamp)
                .setColor("BLUE")
            ]
        });
    } 
}