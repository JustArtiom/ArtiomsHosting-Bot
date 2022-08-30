const { findProxy, deleteProxy } = require(`../../nginxPM/index`)
module.exports = async (client, message, args) => {
    if(!args[1]) return message.reply(`:x: What domain should i unproxy? command usage: \`AH!unproxy <domain>\``)
    if(!domains.get(message.author.id)?.find(x => x.domain === args[1].toLowerCase())) return message.reply(`:x: I could not find this domain in ur domain list`)

    let msg = await message.channel.send(`unproxying . . .`)

    let proxytodelete = await findProxy(args[1].toLowerCase())
    if(!proxytodelete) return msg.edit(`:x: I Could not find your proxied domain.`)

    if(await deleteProxy(proxytodelete.id)){
        msg.edit(`Domain unproxied!`)
        domains.set(message.author.id, domains.get(message.author.id)?.filter(x => x.domain !== args[1].toLowerCase()))
    }else{
        console.log(`${chalk.red('[ Proxy ]')} unproxy domain error: ${args[1].toLowerCase()}`)
        msg.edit(`:x: There was an error deleting the domain!`)
    }
}