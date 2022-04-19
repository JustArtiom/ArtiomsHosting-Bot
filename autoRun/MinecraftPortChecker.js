const config = require('../config.json')
const pinger = require('minecraft-pinger')
const wait = require('node:timers/promises').setTimeout;
const axios = require('axios')
module.exports = async (client) => {
    if(!config.settings.McScript) return

    // let allocationdata = (await axios({
    //     url: config.pterodactyl.host + "/api/application/servers",
    //     method: 'GET',
    //     followRedirect: true,
    //     maxRedirects: 5,
    //     headers: {
    //         'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
    //         'Content-Type': 'application/json',
    //         'Accept': 'Application/vnd.pterodactyl.v1+json',
    //     }
    // }).catch(err => {
    //     console.log('Error getting the ports to check minecraft servers :)')
    //     return
    // }))?.data.data

    // console.log(allocationdata[0])
    
    // for(let allocation of allocationdata){


    // }


    // const ports = { min: 1410, max: 2000 }

    // console.log('Minecraft port checker starts now!')
    // for(var port = ports.min; port <= ports.max; port++){
    //     await pinger.pingPromise('172.18.0.1', port)
    //     .then(async data => {
    //         await axios({d
    //             url: config.pterodactyl.host + "/api/application/nodes/2/allocations",
    //             method: 'GET',
    //             followRedirect: true,
    //             maxRedirects: 5,
    //             headers: {
    //                 'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'Application/vnd.pterodactyl.v1+json',
    //             }
    //         }).then(async response => {
    //             let portID = response.data.data.map(x => x.attributes).filter(x => x.port === port)[0].id
    //             await axios({
    //                 url: config.pterodactyl.host + "/api/application/servers",
    //                 method: 'GET',
    //                 followRedirect: true,
    //                 maxRedirects: 5,
    //                 headers: {
    //                     'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
    //                     'Content-Type': 'application/json',
    //                     'Accept': 'Application/vnd.pterodactyl.v1+json',
    //                 }
    //             }).then(async response => {
    //                 let ServerData = response.data.data.map(x => x.attributes).filter(x=> x.allocation === portID)[0]
    //                 console.log(response.data.data.map(x => x.attributes))
    //                 await client.channels.cache.get(config.channelID.abuse).send(`Minecraft server detected on: \`n1.artiom.host:${port}\`\n\n> Server name: \`${ServerData.name}\`\n> Server id: \`${ServerData.identifier}\`\n> Server uuid: \`${ServerData.uuid}\`\n<https://panel.artiom.host/server/${ServerData.identifier}>`)
                
    //                 axios({
    //                     url: config.pterodactyl.host + '/api/client/servers/' + ServerData.identifier + "/power",
    //                     method: 'POST',
    //                     followRedirect: true,
    //                     maxRedirects: 5,
    //                     headers: {
    //                         'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
    //                         'Content-Type': 'application/json',
    //                         'Accept': 'Application/vnd.pterodactyl.v1+json',
    //                     },
    //                     data: {
    //                         "signal": "kill"
    //                     }
    //                 }).then(() => {}).catch(() => {})
                
    //             }).catch(async err=> {
    //                 await client.channels.cache.get(config.channelID.abuse).send(`I found a minecraft server on \`n1.artiom.host:${port}\` but i could not find who's server is that\n${err}`)
    //             })
    //         }).catch(async err=> {
    //             await client.channels.cache.get(config.channelID.abuse).send(`I found a minecraft server on \`n1.artiom.host:${port}\` but i could not find who's server is that\n${err}`)
    //         })
    //     })
    //     .catch(() => {})

    //     if (port === ports.max){
    //         port = ports.min
    //         await wait(18000000)
    //         console.log('Minecraft port checker starts now!')
    //     } 
    //     await wait(3000)
    // }
}