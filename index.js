const { Client, Collection } = require('discord.js');
const config = require(`./config.json`);
const db = require('quick.db')

const client = new Client({ intents: 32767 })
console.log(`[Rewrite v14] ✅ Client logged in`)

client.snipes = new Collection();
client.commands = new Collection();
client.events = new Collection();
client.auth = new Collection();

global.userData = new db.table("userData");
global.serverCount = new db.table("FreeServerCount");
global.invinfo = new db.table("InviteInfo");
global.invitedBy = new db.table("InvitedByInfo");
global.domains = new db.table("ProxiedDomains");

require(`./handlers/event_handler`)(client);
require(`./handlers/command_handler`)(client);

if(config.settings.consoleSave) require(`./logs/console.log`)();

client.login(config.bot.token);
