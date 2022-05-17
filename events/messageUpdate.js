const config = require('../config.json')
const Discord = require('discord.js')
module.exports = (client, message, newMessage) => {
    if(!message.author || message.author?.bot || message.channel.type === 'dm' || message.guild.channels.cache.get(message.channelId)?.parentId === config.parentID.createAccount) return

    let data = {
        author: message.author,
        member: message.member,
        timestamp: Date.now(),
        action: "edit",
        messageContent: message?.content,
        messageImages: message?.attachments,
    }
    
    if (client.snipes.get(message.channel.id) == null) client.snipes.set(message.channel.id, [data])
    else client.snipes.set(message.channel.id, [...client.snipes.get(message.channel.id), data]);
    client.snipes.set(message.channel.id, client.snipes.get(message.channel.id).filter(x => (Date.now() - x.timestamp) < 300000 && x != null));

    const embed = new Discord.MessageEmbed()
    embed.setTitle('✏️ Edited Message')
    embed.setColor(`BLUE`)
    message.content ? embed.addField(`Message Content`, `\`\`\`\n${message.content}\`\`\``) : null
    message.attachments?.size !== 0 ? embed.setImage(message.attachments?.first()?.proxyURL) : null
    message.attachments?.size !== 0 ? content = message.attachments?.map(x => x?.proxyURL).join("\n") : content = null
    embed.setFooter({ text: `${message.member.user.tag} (${message.member.user.id}) \nin #${message.channel.name}`, iconURL: message?.member?.user?.displayAvatarURL()});
    embed.setTimestamp()
    

    client.channels.cache.get(config.channelID.messages_managering).send({content: content, embeds: [embed]}).catch(err => {})


    // if (oldMessage.author == null || oldMessage.author.bot == true || !oldMessage.content || newMessage == null) return;

    // let data = {
    //     message: oldMessage.content,
    //     member: oldMessage.member,
    //     timestamp: Date.now(),
    //     action: "edit"
    // };

    // if (client.snipes.get(oldMessage.channel.id) == null) client.snipes.set(oldMessage.channel.id, [data])
    // else client.snipes.set(oldMessage.channel.id, [...client.snipes.get(oldMessage.channel.id), data]);

    // client.snipes.set(oldMessage.channel.id, client.snipes.get(oldMessage.channel.id).filter(x => (Date.now() - x.timestamp) < 300000 && x != null));


    // const embed = new Discord.MessageEmbed()
    // .setThumbnail(oldMessage.author.avatarURL)
    // .setColor("BLUE")
    // .addField("Author ", `${oldMessage.author.tag} (ID: ${oldMessage.author.id})`)
    // .addField("Message Content:", `${oldMessage.content === "" ?  "Message had no content" : oldMessage.content}`)
    // .setTimestamp()
    // .setFooter({text: "Message edited in " + oldMessage.channel.name});

    // client.channels.cache.get(config.channelID.messages_managering).send({embeds:[embed]})
}