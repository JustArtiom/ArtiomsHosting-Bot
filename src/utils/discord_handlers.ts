import { ChannelType, Client, EmbedBuilder, Interaction } from "discord.js";
import { getCommands } from "./getCommands";
import { catchHandler, error, log, warn } from "./console";
import { gitPull } from "./git";
import config from "../../config";
import chalk from "chalk";
import fs from "fs";
import { once } from "node:events"
export const main = async (client: Client) => {

    console.log(chalk.hex('#6b7dfb')(`
        _         _   _                     _   _           _   _
       / \\   _ __| |_(_) ___  _ __ ___  ___| | | | ___  ___| |_(_)_ __   __ _
      / _ \\ | '__| __| |/ _ \\| '_ \` _ \\/ __| |_| |/ _ \\/ __| __| | '_ \\ / _\` |
     / ___ \\| |  | |_| | (_) | | | | | \\__ \\  _  | (_) \\__ \\ |_| | | | | (_| |
    /_/   \\_\\_|   \\__|_|\\___/|_| |_| |_|___/_| |_|\\___/|___/\\__|_|_| |_|\\__, |
                   ${chalk.hex('#8290F8')('© 2022 ArtiomsHosting. All rights reserved.')}          |___/
    `))

    if(config.settings.autoUpdate.enabled) {
        log({name: "Github", description: "Checking for updates..."});

        async function do_a_pull(logthis: boolean) {
            const res = await gitPull().catch((i) => {
                if(logthis) error({name: "Github", description: "Couldnt pull from the repo. Log:"})
                console.log(i)
            })
            if(!res) return

            if(logthis) log({name: "Github", description: `${chalk.red("[ IMPORTANT ]")} BOT WAS UPDATED. LOGS:`});
            console.log(res)
            if(logthis) log({name: "Github", description: `${chalk.red("[ IMPORTANT ]")} BOT IS GOING TO SHUT DOWN TO APPLY THE CHANGES`});
            
            await once(client, "ready")
            const gitLog_chan = client.channels.cache.get(config.channels.gitLog)
            if(gitLog_chan && gitLog_chan.type === ChannelType.GuildText) await gitLog_chan.send({
                embeds: [
                    new EmbedBuilder()
                    .setTitle("📬 AutoUpdate from github")
                    .setColor("Blue")
                    .setDescription(`Changes in the github repo has been detected.\n\nChanges has been applied. Logs:\n\`\`\`diff\n${res}\n\`\`\`\n**Shut downing the bot**. Awaiting for restart.`)
                ]
            })

            process.exit();
        }

        await do_a_pull(true);
        if(config.settings.autoUpdate.interval) setInterval(() => do_a_pull(false), config.settings.autoUpdate.interval);
    }

    eventHandler(client)
}


export const eventHandler = async (client: Client) => {
    const event_files = fs.readdirSync(`.${__filename.endsWith(".js") ? "/dist" : ""}/src/discord/events`)
    .filter(file => file.endsWith('.ts') || file.endsWith(".js"));

    for(let file of event_files){
        const event = await import(`../discord/events/${file}`);
        const event_name = file.split('.')[0];
        client.on(event_name, event.event.bind(null, client))
    }
}

export const commandHandler = async (client: Client, interaction: Interaction) => {
    if(!interaction.isChatInputCommand()) return false
    
    let subcommand = interaction.options.getSubcommand(false);
    const commands = await getCommands();

    let command = subcommand ? 
    commands.subcommands[interaction.commandName].find(d => d.name === subcommand) 
    : commands.commands.find(d => d.name === interaction.commandName)
    
    if(!command || !command.run) {
        interaction.reply('Command not found')
        console.log("Command not found")
        return false
    }

    log({name: " / ",description:     `[    Run    ] ${interaction.user.tag} => ${interaction.commandName ? "/"+interaction.commandName : ""}/${command?.name}`})
    command.run(client, interaction).then(() => {
        log({name: " / ",description: `[ Completed ] ${interaction.user.tag} => ${interaction.commandName ? "/"+interaction.commandName : ""}/${command?.name}`})
    }).catch((err: string) => {
        catchHandler(" / ")(` ${interaction.user.tag} => ${interaction.commandName ? "/"+interaction.commandName : ""}/${command?.name}`)
        console.log(err)
        interaction.reply(`:x: ${err}`).catch(() => {})
    })
    return true
}