import { Client, GatewayIntentBits, Partials } from "discord.js";
import { eventHandler, commandHandler } from "./utils/discord_handlers";
import config from "../config";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ], 
    partials: [
        Partials.Channel, 
        Partials.GuildMember, 
        Partials.Message, 
    ] 
});

eventHandler(client);

client.login(config.bot.token);