import { ActivityType, Client } from "discord.js";
import { log } from "../../utils/console";
import chalk from "chalk";
import config from "../../../config";

export const event = (client: Client<true>) => {
    log({ name: "Bot", description: `${chalk.bold(client.user.username)} is ready!`})
    
    if(config.settings.maintenance) client.user.setPresence({ activities: [{ name: 'On maintenance mode...' }], status: 'dnd' });
    else client.user.setPresence({ activities: [{ name: 'over happy customers', type: ActivityType.Watching }], status: 'online' });
}