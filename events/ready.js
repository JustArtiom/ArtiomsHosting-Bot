const chalk = require('chalk');
const config = require('../config.json');
const exec = require('child_process').exec;
const fs = require('fs');
const { EmbedBuilder } = require('discord.js')
let idkwhatisthis = false
module.exports = async (client) => {
    client.channels.cache.get(config.channelID.botBooted).send(`<@918137699842555964> Bot Started ... ${Date.now()}`)
    console.log(chalk.hex('#6b7dfb')(`
    
        _         _   _                     _   _           _   _
       / \\   _ __| |_(_) ___  _ __ ___  ___| | | | ___  ___| |_(_)_ __   __ _
      / _ \\ | '__| __| |/ _ \\| '_ \` _ \\/ __| |_| |/ _ \\/ __| __| | '_ \\ / _\` |
     / ___ \\| |  | |_| | (_) | | | | | \\__ \\  _  | (_) \\__ \\ |_| | | | | (_| |
    /_/   \\_\\_|   \\__|_|\\___/|_| |_| |_|___/_| |_|\\___/|___/\\__|_|_| |_|\\__, |
                                                                        |___/

    `))
    console.log(`${chalk.blue('[ Bot ]')} Logged in as: ${chalk.underline(client.user.tag)}`)
    console.log(`${chalk.blue('[ Bot ]')} Save Console: ${config.settings.consoleSave ? chalk.green('true') : chalk.red('false')}`)
    console.log(`${chalk.blue('[ Bot ]')} Node Status: ${config.settings.nodeStatus ? chalk.green('true') : chalk.red('false')}`)
    console.log(`${chalk.blue('[ Bot ]')} Fastify host: ${config.settings.fastify ? chalk.green('true') : chalk.red('false')}`)
    console.log(`${chalk.blue('[ Bot ]')} Maintenance mode: ${config.settings.maintenance ? chalk.green('true ') : chalk.red('false')}`)
    console.log(`${chalk.blue('[ Bot ]')} Auto Leave Guilds: ${config.settings.autoLeave ? chalk.green('true') : chalk.red('false')}`)
    console.log(`${chalk.blue('[ Bot ]')} Minecraft Port Checker: ${config.settings.McScript ? chalk.green('true') : chalk.red('false')}`)
    console.log(`${chalk.blue('[ Bot ]')} Update files from Github: ${config.settings.updateFromGithub ? chalk.green('true') : chalk.red('false')}`)
    console.log()

    
    if(config.settings.updateFromGithub){
        setInterval(async () => {
            await exec(`git pull origin main`, async (error, stdout) => {
                let response = (error || stdout);
                if (!error) {
                    if (!response.includes("Already up to date.")){
                        console.log(`${chalk.red('[ GitHub ]')} Update found on github. downloading now!`);
                        await client.channels.cache.get(config.channelID.github).send({content: "**RESTARTING . . .**", embeds:[
                            new EmbedBuilder()
                            .setTitle(`**[PULL FROM GITHUB]** New update on GitHub. Pulling.`)
                            .setColor(`Blue`)
                            .setDescription(`Logs:\n\`\`\`\n${response}\`\`\``)
                        ]})
                        console.log(`${chalk.red('[ GitHub ]')} the new version had been installed. Restarting now . . .`)
                        process.exit()
                    }else {
                        if(!idkwhatisthis) {console.log(`${chalk.green('[ GitHub ]')} Bot is up to date\n`); idkwhatisthis = true}
                    }
                }else{
                    console.log(`${chalk.red('[ GitHub ]')} Error: ${error}\n`)
                }
            })
        }, 30000)
    }


    config.settings.maintenance ? client.user.setActivity(config.settings.statusOnMaintenance) : client.user.setActivity("ArtiomsHosting | Rewrite v14", { type: "WATCHING" })

    const autorun = fs.readdirSync(`./autoRun`).filter(file => file.endsWith('.js'));
    autorun.forEach(file => {
        require(`../autoRun/${file}`)(client)
    });

    if(config.settings.autoLeave) client.guilds.cache.forEach(g => {
        if(g.id === config.settings.guildID) return
        g.leave().catch(console.error)
    })
}
