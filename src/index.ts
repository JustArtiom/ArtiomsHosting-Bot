import { main } from "./utils/discord_handlers";
import config from "../config";
import { 
    Client, 
    GatewayIntentBits, 
    Partials 
} from "discord.js";

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

main(client);

client.login(config.bot.token);