const Discord = require('discord.js');
const config = require(`./config.json`);
const db = require('quick.db')

const intents = new Discord.Intents(32767)
const client = new Discord.Client({ intents, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

console.log("index runing . . .")

client.snipes = new Discord.Collection();
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

global.userData = new db.table("userData");
global.serverCount = new db.table("FreeServerCount");
global.invinfo = new db.table("InviteInfo")
global.invitedBy = new db.table("InvitedByInfo")
global.domains = new db.table("ProxiedDomains")

require(`./handlers/event_handler`)(client);
require(`./handlers/command_handler`)(client);

if(config.settings.consoleSave) require(`./logs/console.log`)()

client.login(config.bot.token);