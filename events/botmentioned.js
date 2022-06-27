const client = require("../index");
const { MessageEmbed } = require('discord.js')

client.on('messageCreate', async(message) => {

  if(message.content == `<@${client.user.id}>` || message.content == `<@!${client.user.id}>`){
    return message.reply(`**:wave: Hello __${message.author.username}__**,Im A Bot To Manage Servers And Create Server For You On **Artiom's Hosting!**\n ↳Get Started using \`ah!help\` to see all my commands!`)
  }

})
