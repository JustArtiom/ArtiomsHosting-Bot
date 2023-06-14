import { RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import fs from 'fs';
import { DefaultCommand } from "./types"

export const getCommands = async () => {
    const commands = fs.readdirSync(`.${__filename.endsWith(".js") ? "/dist" : ""}/src/discord/commands`).filter(x => x.endsWith('.ts') || x.endsWith(".js"));
    const subcommands = fs.readdirSync(`.${__filename.endsWith(".js") ? "/dist" : ""}/src/discord/commands`, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

    let commandsarr: DefaultCommand[] = [];
    let subcommandsarr: {[key: string]: DefaultCommand[]} = {};

    for(let file of commands) {
        const cmd = (await import ('../discord/commands/' + file)).default
        commandsarr.push(cmd);
    }

    for(let folder of subcommands) {
        const subcommands_commands = fs.readdirSync(`.${__filename.endsWith(".js") ? "/dist" : ""}/src/discord/commands/` + folder)
        .filter(x => x.endsWith('.ts') || x.endsWith(".js"));

        for(let file of subcommands_commands){
            const cmd = (await import('../discord/commands/' + folder + '/' + file)).default
            if(!subcommandsarr[folder]) subcommandsarr[folder] = [];
            subcommandsarr[folder].push(cmd)
        }
    }

    return({
        commands: commandsarr,
        subcommands: subcommandsarr
    })
}

export const convertCommands = ({commands, subcommands}: {
    commands: DefaultCommand[];
    subcommands: {
        [key: string]: DefaultCommand[];
    }
}) => {
    let data: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []

    for(let command of commands){
        let slash = new SlashCommandBuilder()
        commandBuilder(slash, command)
        data.push(slash.toJSON())
    }

    for(const [subcommand_name, value] of Object.entries(subcommands)){
        let slash = new SlashCommandBuilder()
        slash.setName(subcommand_name)
        slash.setDescription('subcommand')
        value.forEach(v => {
            slash.addSubcommand(subc => {
                commandBuilder(subc, v)
                return subc
            })
        })
        data.push(slash.toJSON())
    }

    return data
}

function commandBuilder(slash: SlashCommandBuilder | SlashCommandSubcommandBuilder, command: DefaultCommand) {
    if(!command.name || !command.description) throw new Error('The slash command name and description must be present')

    slash.setName(command.name)
    slash.setDescription(command.description)

    if(command.stringOption){
        if(typeof command.stringOption !== 'object' || !command.stringOption[0]) throw new Error('The string option must be an non empty array')
        command.stringOption.forEach(d => {
            slash.addStringOption(option => {
                option.setName(d.name)
                option.setDescription(d.description)
                if(d.required) option.setRequired(true)
                if(d.choices) option.addChoices(...d.choices)
                if(d.autoComplete) option.setAutocomplete(true)
                if(d.maxLength) option.setMaxLength(d.maxLength)
                if(d.minLength) option.setMinLength(d.minLength)
                return option
            })
        })
    }

    if(command.channelOption) {
        if(typeof command.stringOption !== 'object' || !command.stringOption[0]) throw new Error('The channel option must be an non empty array')
        command.channelOption.forEach(d => {
            slash.addChannelOption(option => {
                option.setName(d.name)
                option.setDescription(d.description)
                if(d.channelType) option.addChannelTypes(d.channelType)
                if(d.required) option.setRequired(true)
                return option
            })
        })
    }

    if(command.booleanOption) {
        if(typeof command.booleanOption !== 'object' || !command.booleanOption[0]) throw new Error('The boolean option must be an non empty array')
        command.booleanOption.forEach(d => {
            slash.addBooleanOption(option => {
                option.setName(d.name)
                option.setDescription(d.description)
                if(d.required) option.setRequired(true)
                return option
            })
        })
    }
}