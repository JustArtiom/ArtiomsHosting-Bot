import { Client, GatewayIntentBits, Partials } from "discord.js";
import { eventHandler } from "./utils/discord_handlers";
import config from "../config";
import chalk from "chalk";

console.log(chalk.hex('#6b7dfb')(`
        _         _   _                     _   _           _   _
       / \\   _ __| |_(_) ___  _ __ ___  ___| | | | ___  ___| |_(_)_ __   __ _
      / _ \\ | '__| __| |/ _ \\| '_ \` _ \\/ __| |_| |/ _ \\/ __| __| | '_ \\ / _\` |
     / ___ \\| |  | |_| | (_) | | | | | \\__ \\  _  | (_) \\__ \\ |_| | | | | (_| |
    /_/   \\_\\_|   \\__|_|\\___/|_| |_| |_|___/_| |_|\\___/|___/\\__|_|_| |_|\\__, |
                   ${chalk.hex('#8290F8')('© 2022 ArtiomsHosting. All rights reserved.')}          |___/
`))

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ], 
    partials: [
        Partials.Channel, 
        Partials.GuildMember, 
        Partials.Message, 
    ] 
});

eventHandler(client);

client.login(config.bot.token);