const config = require('../config.json')
const fastify = require('fastify')()
const axios = require('axios')
const os = require("os");
const moment = require("moment");
const si = require('systeminformation');

fastify.register(require('@fastify/rate-limit'), {
    max: 150,
    timeWindow: '1 minute',
})

fastify.register(require('@fastify/cors'), { origin: '*' });

module.exports = async (client) => {

    fastify.get('/auth/:userid/:token', async (req, rep) => {
        let token = client.auth.get(req.params.userid);
        if(token === req.params.token){
            rep.send('You had been sucessfully complete your auth, have fun on ArtiomsHosting')
        }else{
            rep.send('404 - Invalid user or token BAKA')
        }
    })

    fastify.get('/data', async (req, reply) => {
        reply.send({
            members: (await client.guilds.cache.get(config.settings.guildID).members.fetch())?.size,
            clients: userData.all().length,
            servers: (await axios({
                url: config.pterodactyl.host+"/api/application/servers",
                method: 'GET',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            }).catch(() => {}))?.data?.meta?.pagination?.total
        })
    })

    fastify.get('/status', async (request, reply) => {
        let memdata = await si.mem();
        let diskdata = await si.fsSize();
        let cl = await si.currentLoad();
        let uptime = await os.uptime();

        let panel
        let lavalink
        let node1 = {
            name: "Node 1",
            status: true,
            cpuload: cl.currentLoad.toFixed(2),
            ramused: memdata.active,
            ramtotal: memdata.total,
            diskused: diskdata[0].used,
            disktotal: diskdata[0].size,
            uptime: uptime * 1000
        }
        let info = {

        }

        await axios({
            url: config.pterodactyl.host + '/api/client/servers/' + "f9dcbdc1" + "/resources",
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).then(data => {
            panel = {
                name: "Panel",
                status: true,
            }
            lavalink = {
                name: "Lavalink",
                status: true,
                state: data.data.attributes.current_state,
                cpuload: data.data.attributes.resources.cpu_absolute,
                ramused: data.data.attributes.resources.memory_bytes,
                ramtotal: 32768,
                diskused: data.data.attributes.resources.disk_bytes,
                disktotal: 32768,
                uptime: data.data.attributes.resources.uptime
            }
            
        }).catch(err => {
            lavalink = {
                name: "Lavalink",
                status: false,
                state: null,
                cpuload: null,
                ramused: null,
                ramtotal: null,
                diskused: null,
                disktotal: null,
                uptime: null
            }
            panel = {
                name: "Panel",
                status: false
            }
        })

        reply.send({
            panel,
            lavalink,
            node1,
            info,
            datatime: Date.now(),
            updatetime: moment().format("YYYY-MM-DD HH:mm:ss")
        })
    })
      
    if(!config.settings.fastify) return
    fastify.listen(1069, "0.0.0.0", (err, address) => {
        if (err) return console.log(`${require('chalk').red('[ Web Server ]')} Listening to the port`)
        console.log(`${require('chalk').magenta('[ Web Server ]')} Listening to ${address}`);
    })
}