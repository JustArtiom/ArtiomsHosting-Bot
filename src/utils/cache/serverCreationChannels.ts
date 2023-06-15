import { Client } from "discord.js";
import config from "../../../config";
import { catchHandler, log } from "../console";

export default async (client: Client) => {
    log({name: "Cache", description: "Updating server creation channels cache"})
    const channels = await client.guilds.cache.get(config.bot.guild)?.channels.fetch()
    if(!channels?.size) return
    const server_creation_channels = channels.filter(x => x?.parentId === config.categories.createAccount)
    
    for(let server of server_creation_channels) {
        if(server[1]) {
            if((Date.now() - server[1]?.createdTimestamp) >= 1_800_000) 
                await server[1]?.delete().catch(catchHandler("Cache"))
            else 
                setTimeout(() => server[1]?.delete().catch(catchHandler("Cache")), 1_800_000 - (Date.now() - server[1]?.createdTimestamp))
        }
    }
    log({name: "Cache", description: "Server creation channels linked and updated"})

}