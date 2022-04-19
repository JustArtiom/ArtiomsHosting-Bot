const config = require('../../config.json')
const dns = require('dns')
const axios = require('axios');

// Settings so it will be easy for you to test my script
host = config.nginxPM.host
email = config.nginxPM.email,
pass = config.nginxPM.pass
proxyip = '5.196.239.157'

const options = {
    family: 4,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
};

module.exports = async () => {

    // Get Token
    const token = (await axios({
        url: `${host}/api/tokens`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: {
            "identity": email,
            "secret": pass
        }
    }).catch(err => {}))?.data?.token;

    if(!token) return

    // Get all proxies 
    let domains = await axios({
        url: host + "/api/nginx/proxy-hosts",
        method: 'GET',
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            'Authorization': "Bearer "+token,
            'Content-Type': 'application/json',
        }
    })

    domains.data.forEach(async info => {
        await dns.lookup(info.domain_names[0], options, async (err, address, family) => {

            if(address === proxyip) {
                if(info.enabled === 1) return
                await axios({
                    url: host + "/api/nginx/proxy-hosts/"+info.id+"/enable",
                    method: 'POST',
                    followRedirect: true,
                    maxRedirects: 5,
                    headers: {
                        'Authorization': "Bearer "+token,
                        'Content-Type': 'application/json',
                    }
                }).then(() => {
                    console.log(`I enabled the proxy   ${info.domain_names[0]}   because it have the right ip   ${address}   `)
                }).catch((err) => {
                    console.log(`I could not enable   ${info.domain_names[0]}`)
                })
                return 
            }

            if(info.enabled === 0) return
            await axios({
                url: host + "/api/nginx/proxy-hosts/"+info.id+"/disable",
                method: 'POST',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': "Bearer "+token,
                    'Content-Type': 'application/json',
                }
            }).then(() => {
                console.log(`Proxy   ${info.domain_names[0]}   has been disabled because the ip was   ${address}   `)
            }).catch(() => {
                console.log(`I Could not disable this proxy: ${info.domain_names[0]}   with the    ${address}   `)
            })
        });
    })
}