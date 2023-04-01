import { Client } from "discord.js";
import { log, warn, error } from "../../utils/console";

export const event = (client: Client<true>) => {
    log(`${client.user.username} is ready`)
    warn("test")
    error("test")

    log({name: "Bot", description: "yes"})
    warn({name: "Bot", description: "yes"})
    error({name: "Bot", description: "yes"})
}