import { Client, Interaction } from "discord.js";
import { commandHandler } from "../../utils/discord_handlers";
import config from "../../../config";
export const event = async (client: Client<true>, interaction: Interaction) => {
    if(
        interaction.inCachedGuild() &&
        config.settings.maintenance && 
        !interaction.member?.roles.cache.has(config.roles.beta_testers)
    ) return 
    if(await commandHandler(client, interaction)) return
}