import { ActivityType, Client } from "discord.js";
import { log } from "../../utils/console";
import chalk from "chalk";
import config from "../../../config";

import ServerCreationChannelsCache from "../../utils/cache/serverCreationChannels";
import { premiumServers } from "../../utils/cache/premiumServers";

export const event = async (client: Client<true>) => {
    log({ name: "Bot", description: `${chalk.bold(client.user.username)} is ready!`})
    
    if(config.settings.maintenance) client.user.setPresence({ activities: [{ name: 'On maintenance mode...' }], status: 'dnd' });
    else client.user.setPresence({ activities: [{ name: 'over happy customers', type: ActivityType.Watching }], status: 'online' });

    ServerCreationChannelsCache(client);

    if(config.settings.locations.premium.length){
        log({name: "Cache", description: "Updating premium servers cache"});
        await premiumServers.updateCache();
        log({name: "Cache", description: "Premium servers cache updated, starting chargin and monitoring servers."});
        premiumServers.updateCacheInterval(1_800_000);
        premiumServers.monitorCharges();
    }
}