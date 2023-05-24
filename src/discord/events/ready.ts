import { Client } from "discord.js";
import { log } from "../../utils/console";
import chalk from "chalk";

export const event = (client: Client<true>) => {
    log({ name: "Bot", description: `${chalk.bold(client.user.username)} is ready!`})
}