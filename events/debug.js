const config = require('../config.json')
module.exports = async (client, data) => {
    if(data.includes('Hit a 429 while executing a request.')){
        console.log(`${require('chalk').red('[ DISCORD ]')} ${data}`)
        data.split('\n').filter(x => x.includes("Sublimit")).length !== 0 ? console.log(`${require('chalk').red('[ DISCORD ]')} Rate Limit for the next: ${require('ms')(require('ms')(data.split('\n').filter(x => x.includes("Sublimit"))[0].split(' ').reverse()[0]))} (${data.split('\n').filter(x => x.includes("Sublimit"))[0].split(' ').reverse()[0]})`) : null
        client?.channels.cache.get(config.channelID.errorLog)?.send(data ? `\`\`\`\n${data}\`\`\`` : 'no data provided').catch(err => {})
    }
}