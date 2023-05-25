import { Channel, ChatInputCommandInteraction, InteractionReplyOptions, Message, MessageCreateOptions, MessagePayload } from "discord.js";

export default async (data: {
    callback: () => boolean | Promise<boolean>
    tries?: number 
    send: string | InteractionReplyOptions 
}[]) => {
    for(let {callback, tries, send} of data) {
        if(await callback()) return send
        else undefined
    }
}