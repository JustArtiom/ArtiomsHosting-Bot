module.exports = (client, message) => {

    let data = {
        message: message.content,
        member: message.member,
        timestamp: Date.now(),
        action: "delete",
        image: message.attachments.first() ? message.attachments.first().proxyURL : null
    };

    if (client.snipes.get(message.channel.id) == null) client.snipes.set(message.channel.id, [data])
    else client.snipes.set(message.channel.id, [...client.snipes.get(message.channel.id), data]);

    client.snipes.set(message.channel.id, client.snipes.get(message.channel.id).filter(x => (Date.now() - x.timestamp) < 300000 && x != null));

}