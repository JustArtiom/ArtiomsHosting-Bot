const Canvas = require('canvas');
const Discord = require('discord.js')
const moment = require('moment')

const av = {
    size: 96,
    x: 0,
    y: 0  
}

async function wrap(string) {
    let str = string;
    let splitted = str.split(' ');
    let arr = []
    let maxChars = 35;

    splitted.forEach(split => {
        if (!arr.length || arr[arr.length - 1].length + split.length >= maxChars) {
            arr.push(split);
        } else {
            arr[arr.length - 1] += ` ${split}`;
        }
    })
    return arr.join('\n');
}

module.exports = {
    name: "betasnipe",
    aliases: [],
    async run (client, message, args) {

        return
        let snipe = client.snipes.get(message.channel.id)
        if (!snipe) return message.channel.send(`:x: There is nothing to snipe`)

        snipe = [...snipe.values()]
        snipe.reverse();

        let number = 0;

        if (!args[0]) number = 0;
        else number = (parseInt(args[0]) - 1);

        if (number >= snipe.length) number = snipe.length - 1;
        if (number < 0) number = 0;

        let snipedMessage = snipe[number];
        let member = snipedMessage.member
        console.log(snipedMessage)

        let theaccualtext = (await wrap(snipedMessage.message ?? "No Message Content"))

        let avatarURL = member.user.displayAvatarURL({format: 'png', size: av.size})

        const canvas = Canvas.createCanvas(700, theaccualtext.split('\n').length * 42 + 75)
        const ctx = canvas.getContext('2d');

        const avimg = await Canvas.loadImage(avatarURL);
        ctx.save()
        ctx.beginPath()
        ctx.arc(av.x + av.size / 2, av.y + av.size / 2, av.size / 2, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.clip()

        ctx.drawImage(avimg, av.x, av.y)
        ctx.restore()

        // Username
        ctx.fillStyle = "white"
        ctx.font = "42px Sans"

        ctx.fillText(member.user.username, 125, 45)

        // Date and time
        let usernamesize = ctx.measureText(member.user.username);
        ctx.fillStyle = "lightgray"
        ctx.font = "26px Sans"
        ctx.fillText(`${moment().format("ss:mm:HH DD-MM-YY")}`, 125 + usernamesize.width + 25, 43)

        // Text
        ctx.fillStyle = "white"
        ctx.font = "32px Sans"

        ctx.fillText(theaccualtext, 125, 90)

        // edit or deleted
        let lastmsgmeasure = ctx.measureText(theaccualtext.split("\n").reverse()[0]).width
        ctx.fillStyle = "lightgray"
        ctx.font = "22px Sans"
        ctx.fillText(`(${snipedMessage.action})`, 145 + lastmsgmeasure, 46 + theaccualtext.split('\n').length * 40)
        

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'yes.png');
        message.channel.send({files: [attachment]})

    }
}