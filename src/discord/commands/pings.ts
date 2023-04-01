import { Client, ChatInputCommandInteraction } from "discord.js"
import { DefaultCommand } from "../../utils/types"

export default <DefaultCommand> {
    name: 'ping',
    description: 'Shows bot latency information',
    run: async (client, interaction) => {
        interaction.reply('pong')
    }
}