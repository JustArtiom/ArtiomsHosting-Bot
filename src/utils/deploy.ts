import { Client, REST, Routes } from "discord.js";
import config from "../../config";
import { getCommands, convertCommands } from "./getCommands";

export const deploy = async (client?: Client) => {
    let id = config.bot.id;
    let token = config.bot.token;
    let guild = process.argv[3] ?? "*"

    if(client?.isReady() && client.user?.id !== id) 
        throw new Error("Updating Slash Commands Error - Client id is not the same as in the config file");
    if(!id || !token) 
        throw new Error("Updating Slash Commands Error - Bot token or id is missing form config.ts")

    const start = Date.now()
    console.log(`( / ) starting updating slash commands on ${guild === "*" ? "all servers" : `guild with id ${guild}`}`);

    const rest = new REST({ version: '10' }).setToken(token);
    let cmds = convertCommands(await getCommands())
    if(!cmds.length) return console.log("( X ) There is no command to be updated")

    console.log(`( / ) Updating ${cmds.length} commands`)
    const data = await rest.put(
		guild === '*' ? Routes.applicationCommands(id) : Routes.applicationGuildCommands(id, guild),
		{ body: cmds },
	);

    console.log(`( / ) Commands updated sucessfully`)
}

if(process.argv[2] === "deploy"){
    deploy()
}
