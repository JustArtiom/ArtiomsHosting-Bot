const util = require(`util`)
const { settings: { admin } } = require('../../config.json')
const Discord = require('discord.js')
module.exports = {
    name: "eval",
    aliases: [''], 
    async run(client, message, args){
        if(!admin.includes(message.author.id)) return

        let code = message.content.replace(/ah!eval|AH!eval|eval/g, '');
        let async = false
        let silent = false

        if(['token', "leave()"].some(x => message.content.toLowerCase().includes(x)) && !message.content.includes('-allow')) return message.channel.send('no no no, naughty naughty boy')
        if(message.content.includes('-s')) silent = true
        if(message.content.includes('-a')) async = true
        
        code = code.replace(/-s|-allow|-a/g, '')

        try{
            let evaled = await eval(async ? `(async () => {${code}})()` : code)
            if (typeof evaled !== 'string') {
                evaled = util.inspect(evaled);
            }
            if(evaled.includes(client.token)) return message.channel.send(`no no no, naughty naughty boy... u want my token???`)

            if(silent) return
            if(evaled.length > 4000){
                if(silent) return
                message.channel.send({
                    embeds:[
                        new Discord.MessageEmbed()
                        .setTitle(`Eval by ${message.author.tag}`)
                    	.setColor(`GREEN`)
                    ]
                })
                message.channel.send({
                    files:[
                        {
                            attachment: Buffer.from(evaled),
                            name: "eval.js"
                        }
                    ]
                })
            }else{
                message.channel.send({
                    embeds:[
                        new Discord.MessageEmbed()
                        .setTitle(`Eval by ${message.author.tag}`)
                    	.setColor(`GREEN`)
                        .setDescription(`\`\`\`js\n${evaled}\`\`\``)
                    ]
                })
            }

        }catch(err){
            message.channel.send({
                embeds:[
                    new Discord.MessageEmbed()
                    .setTitle(`:x: | Error`)
                    .setColor(`RED`)
                    .setDescription(`${err}`)
                ]
            })
        }
        

        
    }   
}