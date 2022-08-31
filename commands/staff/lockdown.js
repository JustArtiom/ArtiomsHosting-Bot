const { PermissionFlagsBits } = require('discord.js');

module.exports = async (client, message, args) => {
    if (message.channel.permissionsFor(message.guild.id).has(PermissionFlagsBits.SendMessages)) {
        message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        message.channel.send(':x: Oh no, monkeypox came in this channel, time for a lockdown!');
    } else {
        message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true});
        message.channel.send(':x: Channel unlocked!')
};
