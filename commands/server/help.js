const { EmbedBuilder } = require('discord.js');
module.exports = (client, message, args) => {
    message.channel.send({embeds:[
        new EmbedBuilder()
        .setTitle(`❓ | Need help?`)
        .setColor(`Red`)
        .setDescription(`\`AH!server count\` - shows how many server slots you have and used\n\`AH!server create\` - create a server\n\`AH!server delete\` - delete a server\n\`AH!server list\` - shows all your servers created\n\`AH!server status\` - allows you to interact with the server\n\`AH!server proxy\` - Proxy your server to your domain\n\`AH!server unproxy\` - Delete a proxy`)
    ]})
}
