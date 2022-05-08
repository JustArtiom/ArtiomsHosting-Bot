module.exports = (client, oldMessage, newMessage) => {

    if (oldMessage.author == null || oldMessage.author.bot == true || !oldMessage.content || newMessage == null) return;

    let data = {
        message: oldMessage.content,
        member: oldMessage.member,
        timestamp: Date.now(),
        action: "edit"
    };

    if (client.snipes.get(oldMessage.channel.id) == null) client.snipes.set(oldMessage.channel.id, [data])
    else client.snipes.set(oldMessage.channel.id, [...client.snipes.get(oldMessage.channel.id), data]);

    client.snipes.set(oldMessage.channel.id, client.snipes.get(oldMessage.channel.id).filter(x => (Date.now() - x.timestamp) < 300000 && x != null));

}