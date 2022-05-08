module.exports = async (client, message, args) => {
    if(message.channel.permissionsFor(message.guild.id).has('SEND_MESSAGES')){
        message.channel.permissionOverwrites.edit(message.channel.guild.roles.everyone, {SEND_MESSAGES: false });
        message.channel.send(`:x: Oh no, covid came in this channel, time for a lockdown!`)
    }else{
        message.channel.permissionOverwrites.edit(message.channel.guild.roles.everyone, {SEND_MESSAGES: null });
        message.channel.send(`:x: Channel unlocked!`)
    }
}