import { ActivityType, Client } from "discord.js";
import { log, warn } from "../../utils/console";
import chalk from "chalk";
import config from "../../../config";
import { setTimeout as wait } from "node:timers/promises"
import ServerCreationChannelsCache from "../../utils/cache/serverCreationChannels";
import { premiumServers } from "../../utils/cache/premiumServers";

export const event = async (client: Client<true>) => {
    log({ name: "Bot", description: `${chalk.bold(client.user.username)} is ready!`})
    
    if(config.settings.maintenance) client.user.setPresence({ activities: [{ name: 'On maintenance mode...' }], status: 'dnd' });
    else client.user.setPresence({ activities: [{ name: 'over happy customers', type: ActivityType.Watching }], status: 'online' });

    ServerCreationChannelsCache(client);

    if(config.settings.locations.premium.length){
        log({name: "Cache", description: "Updating premium servers cache"});
        await premiumServers.updateCache().then(() => {
            log({name: "Cache", description: "Premium servers cache updated"});
            log({name: " $ ", description: "Starting to charge and monitor premium servers"});
            premiumServers.monitorCharges().catch(() => {});
        }).catch((err) => {
            warn({name: "Cache", description: err})
        });
        premiumServers.setInterval(600_000);
    }
}