import { Client, REST, Routes } from "discord.js";
import config from "../../config";
import { getCommands, convertCommands } from "./getCommands";
import { log, error } from "./console";

export const deploy = async (client?: Client, logmessages?: boolean) => {
    let id = config.bot.id;
    let token = config.bot.token;
    let guild = config.bot.guild

    if(client?.isReady() && client.user?.id !== id) 
        throw new Error("Updating Slash Commands Error - Client id is not the same as in the config file");
    if(!id || !token) 
        throw new Error("Updating Slash Commands Error - Bot token or id is missing form config")

    const start = Date.now()
    if(logmessages) log({name: "/", description: `starting updating slash commands on ${guild === "*" ? "all servers" : `guild with id ${guild}`}`});

    const rest = new REST({ version: '10' }).setToken(token);
    let cmds = convertCommands(await getCommands())
    if(!cmds.length) {
        if(logmessages) error({name: "/", description: "There is no command to be updated"})
        return false
    }

    if(logmessages) log({name: "/", description: `Updating ${cmds.length} commands...`})
    const data = await rest.put(
		guild === '*' ? Routes.applicationCommands(id) : Routes.applicationGuildCommands(id, guild),
		{ body: cmds },
	);

    if(logmessages) log({name: "/", description: `Commands updated sucessfully in ${Date.now() - start}ms!`})
    else return true
}

if(process.argv[2] === "deploy"){
    deploy(undefined, true)
}
