import { ChannelType, ChatInputCommandInteraction, Client } from "discord.js"

export interface DefaultCommand {
    name: string,
    description: string,
    stringOption?: {
        name: string,
        description: string,
        required: boolean,
        maxLength: number,
        minLength: number,
        autoComplete: boolean,
        choices: {
            name: string, 
            value: string
        }[]
    }[],
    channelOption?: {
        name: string,
        description: string,
        channelType:
            ChannelType.GuildText | 
            ChannelType.GuildVoice | 
            ChannelType.GuildCategory | 
            ChannelType.GuildAnnouncement | 
            ChannelType.AnnouncementThread | 
            ChannelType.PublicThread | 
            ChannelType.PrivateThread | 
            ChannelType.GuildStageVoice | 
            ChannelType.GuildForum
        required: boolean
    }[],
    booleanOption?: {
        name: string,
        description: string,
        required: boolean
    }[],
    run: (
        client: Client<true>, 
        interaction: ChatInputCommandInteraction
    ) => Promise<any>
}

export interface DBUserLogs {
    commands: {
        command: string,
        completed?: boolean,
        timestamp: number
    }[]
}

export interface DBUser {
    discordid: string,
    pteroid: number,
    username: string,
    email: string,
    balance: number,
    createdTimestamp: number,
}