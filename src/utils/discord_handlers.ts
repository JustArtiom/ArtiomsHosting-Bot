import { Client, Interaction } from "discord.js";
import fs from "fs";
import { getCommands } from "./getCommands";

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

    command.run(client, interaction).catch((err: string) => {
        interaction.reply(`:x: ${err}`).catch(() => {})
    })
    return true
}