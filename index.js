const Client = require('discord.js');
const config = require(`./config.json`);
const db = require('quick.db')

const client = new Client({ intents: 32767 })
console.log(`[Rewrite v14] ✅ Client logged in as: ${client.user.username}`)

client.snipes = new Discord.Collection();
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.auth = new Discord.Collection();

global.userData = new db.table("userData");
global.serverCount = new db.table("FreeServerCount");
global.invinfo = new db.table("InviteInfo");
global.invitedBy = new db.table("InvitedByInfo");
global.domains = new db.table("ProxiedDomains");

require(`./handlers/event_handler`)(client);
require(`./handlers/command_handler`)(client);

if(config.settings.consoleSave) require(`./logs/console.log`)();

client.login(config.bot.token);