const config = require('../config.json')
module.exports = (client) => {
    const guild = client.guilds.cache.get(config.settings.guildID)
    guild.members.cache.forEach(m => {
        m.roles.add(guild.roles.cache.get(config.roleID.member))
    })
}