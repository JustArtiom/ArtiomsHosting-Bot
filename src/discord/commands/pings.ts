import { DefaultCommand } from "../../utils/types";
import { EmbedBuilder } from "discord.js";

export default <DefaultCommand> {
    name: 'ping',
    description: 'Shows bot latency information',
    run: async (client, interaction) => {
        interaction.reply({embeds: [
            new EmbedBuilder()
            .setTitle(`🏓 | Latency info`)
            .setColor(`${client.ws.ping > 300 ? client.ws.ping > 1000 ? "Red" : "Yellow" : "Green"}`)
            .setDescription(`Websocket ping: ${client.ws.ping}ms`)
        ]});
    }
}