const { EmbedBuilder } = require('discord.js')
module.exports = {
    name: "snipe",
    aliases: [''], 
    async run(client, message, args){

        let snipe = client.snipes.get(message.channel.id)
        if (!snipe) return message.channel.send(`:x: There is nothing to snipe in this channel`)

        snipe = [...snipe.values()]
        snipe.reverse();

        let number = 0;

        if (!args[0]) number = 0;
        else number = (parseInt(args[0]) - 1);

        if (number >= snipe.length) number = snipe.length - 1;
        if (number < 0) number = 0;

        let snipedMessage = snipe[number];

        const embed = new EmbedBuilder()
        embed.setTitle(`Sniping...`)
        embed.setColor(`BLUE`)
        snipedMessage.messageContent ? embed.addField({ name: `Message Content`, value:`${snipedMessage.messageContent}`) : null
        snipedMessage.messageImages?.size !== 0 ? embed.setImage(snipedMessage.messageImages?.first()?.proxyURL) : null
        embed.setFooter({ text: ${snipedMessage.member.user.tag} (${snipedMessage.member.user.id}), iconURL: snipedMessage?.member?.user?.displayAvatarURL()});
        embed.setTimestamp()

        message.channel.send({
            embeds: [embed]
        })
    } 
}