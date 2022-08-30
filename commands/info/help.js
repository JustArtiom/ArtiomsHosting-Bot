const { EmbedBuilder } = require('discord.js');
module.exports = (client, message, args) => {
    message.channel.send({
        embeds:[
          new EmbedBuilder()
          .setTitle(`❓ | Need help?`)
          .setColor(`#677bf9`)
.addFields(
  { name: `**Pterodactyl commands:**`, value: `AH!user\nAH!server`, inline: true },
  { name: `**Info:**`, value: `AH!ping\nAH!invites\nAH!help`, inline: true },
)
        ]
    })
}