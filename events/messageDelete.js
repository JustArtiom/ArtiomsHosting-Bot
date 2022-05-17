const config = require('../config.json')
const Discord = require('discord.js')
module.exports = (client, message) => {
    if(!message.author || message.author?.bot || message.channel.type === 'dm' || message.guild.channels.cache.get(message.channelId)?.parentId === config.parentID.createAccount) return

    let data = {
        author: message.author,
        member: message.member,
        timestamp: Date.now(),
        action: "delete",
        messageContent: message.content,
        messageImages: message.attachments,
    }

    if (client.snipes.get(message.channel.id) == null) client.snipes.set(message.channel.id, [data])
    else client.snipes.set(message.channel.id, [...client.snipes.get(message.channel.id), data]);
    client.snipes.set(message.channel.id, client.snipes.get(message.channel.id)?.filter(x => (Date.now() - x?.timestamp) < 300000 && x != null));

    let content = null;

    const embed = new Discord.MessageEmbed()
    embed.setTitle('❌ Deleted Message')
    embed.setColor(`BLUE`)
    message.content ? embed.addField(`Message Content`, `\`\`\`\n${message.content}\`\`\``) : null
    message.attachments?.size !== 0 ? embed.setImage(message.attachments?.first()?.proxyURL) : null
    message.attachments?.size !== 0 ? content = message.attachments?.map(x => x?.proxyURL).join("\n") : content = null
    embed.setFooter({ text: `${message.member.user.tag} (${message.member.user.id}) \nin #${message.channel.name}`, iconURL: message?.member?.user?.displayAvatarURL()});
    embed.setTimestamp()
    

    client.channels.cache.get(config.channelID.messages_managering).send({content: content, embeds: [embed]}).catch(err => {})

    // if (message.channel.type === 'dm') return;
    // if (message.author == null) return;

    // let data = {
    //     message: message.content,
    //     member: message.member,
    //     timestamp: Date.now(),
    //     action: "delete",
    //     image: message.attachments.first() ? message.attachments.first().proxyURL : null
    // };

    // if (client.snipes.get(message.channel.id) == null) client.snipes.set(message.channel.id, [data])
    // else client.snipes.set(message.channel.id, [...client.snipes.get(message.channel.id), data]);

    // client.snipes.set(message.channel.id, client.snipes.get(message.channel.id).filter(x => (Date.now() - x.timestamp) < 300000 && x != null));

    // const embed = new Discord.MessageEmbed()
    // .setThumbnail(message.author.avatarURL)
    // .setColor("BLUE")
    // .addField("Author ", `${message.author.tag} (ID: ${message.author.id})`)
    // .addField("Message Content:", `${message.content === "" ?  "Message had no content" : message.content}`)
    // .setTimestamp()
    // .setFooter({text: "Message delete in " + message.channel.name});

    // client.channels.cache.get(config.channelID.messages_managering).send({embeds:[embed]})
}