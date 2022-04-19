const chalk = require('chalk')
const config = require('../config.json')
const fs = require('fs')
module.exports = async (client) => {
    console.log(chalk.hex('#6b7dfb')(`
        _         _   _                     _   _           _   _
       / \\   _ __| |_(_) ___  _ __ ___  ___| | | | ___  ___| |_(_)_ __   __ _
      / _ \\ | '__| __| |/ _ \\| '_ \` _ \\/ __| |_| |/ _ \\/ __| __| | '_ \\ / _\` |
     / ___ \\| |  | |_| | (_) | | | | | \\__ \\  _  | (_) \\__ \\ |_| | | | | (_| |
    /_/   \\_\\_|   \\__|_|\\___/|_| |_| |_|___/_| |_|\\___/|___/\\__|_|_| |_|\\__, |
                                                                        |___/

    `))
    console.log(`Logged in as: ${chalk.underline(client.user.tag)}`)
    console.log(`Save Console: ${config.settings.consoleSave ? chalk.green('true') : chalk.red('false')}`)
    console.log(`Node Status: ${config.settings.nodeStatus ? chalk.green('true') : chalk.red('false')}`)
    console.log(`Maintenance mode: ${config.settings.maintenance ? chalk.green('true ') : chalk.red('false')}`)
    console.log(`Auto Leave Guilds: ${config.settings.autoLeave ? chalk.green('true') : chalk.red('false')}`)
    console.log(`Minecraft Port Checker: ${config.settings.McScript ? chalk.green('true') : chalk.red('false')}`)
    console.log()

    config.settings.maintenance ? client.user.setActivity(config.settings.statusOnMaintenance) : client.user.setActivity("ArtiomsHosting", { type: "WATCHING" })

    const autorun = fs.readdirSync(`./autoRun`).filter(file => file.endsWith('.js'));
    autorun.forEach(file => {
        require(`../autoRun/${file}`)(client)
    });

    if(config.settings.autoLeave) client.guilds.cache.forEach(g => {
        if(g.id === config.settings.guildID) return
        g.leave().catch(console.error)
    })
}