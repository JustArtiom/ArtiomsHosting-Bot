const Discord = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');
module.exports = async (client, message, args) => {
    if(!userData.get(message.author.id)) return message.reply(":x: You dont have an account created. type `AH!user new` to create one")

    const CAPSNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var getPassword = () => {

        var password = "";
        while (password.length < 10) {
            password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
        }
        return password;
    };

    let password = await getPassword();
    axios({
        url: config.pterodactyl.host + "/api/application/users/" + userData.get(message.author.id).consoleID,
        method: 'GET',
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'Application/vnd.pterodactyl.v1+json',
        },
    }).then(fetch => {
        const data = {
            "email": fetch.data.attributes.email,
            "username": fetch.data.attributes.username,
            "first_name": fetch.data.attributes.first_name,
            "last_name": fetch.data.attributes.last_name,
            "password": password
        }
        axios({
            url: config.pterodactyl.host + "/api/application/users/" + userData.get(message.author.id).consoleID,
            method: 'PATCH',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
            data: data,
        }).then(user => {
            client.users.cache.get(message.author.id).send({embeds:[
                new Discord.MessageEmbed()
                .setColor(`BLUE`)
                .setDescription(`New password for ArtiomsHosting: ||**${data.password}**||`)
                .setFooter({text:`This message will autodestruct in 10 minutes`})
            ]}).then(x => {
                message.channel.send({embeds:[
                    new Discord.MessageEmbed()
                    .setTitle(`✅ | Password Changed Succesufuly`)
                    .setColor(`GREEN`)
                    .setDescription(`Check your [dms](https://discord.com/channels/@me/${x.channelId}) for your new password!`)
                ]}).catch(err => {
                    message.channel.send(`${err}`)
                })
                setInterval(() => {
                    x.delete().catch(err => {})
                },600000)
            }).catch(err => {
                message.channel.send(`${err}`)
            })
        }).catch(err => {
            message.channel.send(`${err}`)
        })
    }).catch(err => {
        message.channel.send(`${err}`)
    })
}