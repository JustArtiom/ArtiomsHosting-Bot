import { EmbedBuilder, Message } from "discord.js"
import { catchHandler } from "./console"
import { setTimeout as wait } from 'node:timers/promises';

export type toCollectParam = {
    id: string;
    ask: string;
    description?: string;
    tries?: number | undefined;
    run?: (collectedData: {id: string, data: string}[]) => any;
    validation: (message: Message<boolean>) => Promise<{
        error: boolean;
        message: string;
    }>;
}

export default async ({
    filter,
    toCollect,
    message
}: {
    filter?: (message: Message) => boolean
    toCollect: toCollectParam[]
    message: Message
}) => {
    if(!toCollect.length) throw new Error("The collector handler toCollect params must be present")
    if(!message) throw new Error("The collector handler channel must be provided")

    const collectedData: {id: string, data: string}[] = []

    for(let { id, ask, description, tries, validation, run } of toCollect) {
        message.edit({embeds: [
            (() => {
                const embed = new EmbedBuilder()
                .setTitle(ask)
                .setColor("Yellow")
                .setFooter({text: "type \"cancel\" or \"stop\" to stop the data this process"})
                if(description) embed.setDescription(description)
                return embed
            })()
        ], components: []});
        if(run && await run(collectedData)) return { 
            error: true, 
            message: "Error sending the email..."
        }

        for(var i = 1; i < (tries ? tries-1 : 7); i++) {
            if(typeof tries == "number" && tries <= 0) break
            let collected = (await message.channel.awaitMessages({filter, max: 1, time: 300_000}).catch(() => {}))?.first();
            if(!collected) break
            collected.delete().catch(catchHandler("Bot")) 
            if(["stop", "cancel"].includes(collected.content.toLocaleLowerCase())) break
            
            const check = await validation(collected)
            if(!check.error) {
                collectedData.push({id, data: check.message});
                break
            } else {
                if(i >= 0) message.channel.send({embeds: [
                    new EmbedBuilder()
                        .setTitle(check.message)
                        .setColor("Red")

                ]}).then(async (m) => {
                    await wait(3000)
                    m.delete().catch(catchHandler("Bot"))
                })
            }
        }

        if(!collectedData.find(x => x.id === id)) return { 
            error: true, 
            message: 
                i <= 0 ? "You tried too many times" :
                "Not enough data. Thank you for the time spent, have nice day!"
        }
    }

    return collectedData
}