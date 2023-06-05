import { Channel, ChatInputCommandInteraction, InteractionReplyOptions, Message, MessageCreateOptions, MessagePayload } from "discord.js";

export default async (data: {
    callback: () => boolean | Promise<boolean>
    tries?: number 
    interaction?: string | InteractionReplyOptions,
    message?: any
}[]) => {
    for(let {callback, tries, interaction, message} of data) {
        if(await callback()) return interaction || message || "No message to reply with"
        else undefined
    }
}