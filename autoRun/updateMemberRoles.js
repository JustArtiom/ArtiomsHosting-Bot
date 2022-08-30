const config = require('../config.json')
module.exports = (client) => {
    const guild = client.guilds.cache.get(config.settings.guildID);
    const members = guild.members.cache.filter(x => !x.roles.cache.has(config.roleID.member));

    members.forEach(m => {
        m.roles.add(guild.roles.cache.get(config.roleID.member));
    })
}