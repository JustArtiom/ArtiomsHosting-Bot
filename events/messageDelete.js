        const config = require('../config.json')
const { EmbedBuilder } = require('discord.js')
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

    const embed = new EmbedBuilder()
    embed.setTitle('❌ Deleted Message')
    embed.setColor(`Blue`)
    message.content ? embed.addFields(
		{ name: 'Message Content', value: message.content.includes('```') ? `${message.content}` : `\`\`\`\n${message.content}\`\`\`` },
     ) : null
    message.attachments?.size !== 0 ? embed.setImage(message.attachments?.first()?.proxyURL) : null
    message.attachments?.size !== 0 ? content = message.attachments?.map(x => x?.proxyURL).join("\n") : content = null
    embed.setFooter({ text: `${message.member.user.tag} (${message.member.user.id}) \nin #${message.channel.name}`, iconURL: message?.member?.user?.displayAvatarURL()});
    embed.setTimestamp()
    

    client.channels.cache.get(config.channelID.messages_managering).send({content: content, embeds: [embed]}).catch(err => {})
}
