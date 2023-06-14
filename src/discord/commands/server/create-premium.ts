import { EmbedBuilder } from "discord.js";
import { DefaultCommand } from "../../../utils/types";
import validatorCheck from "../../../utils/validatorCheck";
import { premiumServers } from "../../../utils/cache/premiumServers";
import fs from "node:fs";

export default <DefaultCommand> {
    name: "create-premium",
    description: "Create a premium server",
    stringOption: [
        {
            name: "type",
            description: "Server type",
            required: true,
            choices: fs.readdirSync(`${__filename.endsWith(".js") ? "./dist" : "."}/src/server_creation`)
                .map(x => ({name: x.slice(0, x.length-3), value: x.slice(0, x.length-3)}))
        },
        {
            name: "cpu",
            description: "How many cores do you want the server to have",
            required: true
        },
        {
            name: "ram",
            description: "How much RAM in GB do you want your server to have",
            required: true
        },
        {
            name: "disk",
            description: "How much DISK in GB do you want your server to have",
            required: true
        },
        {
            name: "name",
            description: "Server name",
        }
    ],
    run: async (client, interaction) => {
        interaction.reply("This command is not done yet")
    }
}

export const createPremiumServer = () => {

}