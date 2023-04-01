import { Client, Interaction } from "discord.js";
import { commandHandler } from "../../utils/discord_handlers";
export const event = async (client: Client<true>, interaction: Interaction) => {
    if(await commandHandler(client, interaction)) return
}