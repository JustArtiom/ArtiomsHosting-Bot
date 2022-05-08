const dns = require('dns')

const getDomainIP = async (domain) => {
    let ip;

    const options = {
        family: 4,
        hints: dns.ADDRCONFIG | dns.V4MAPPED,
    };

    return await new Promise((res, rej) => {
        dns.lookup(domain, options, (err, address, family) =>
            res(address)
        );
    })
}

module.exports = {
    getDomainIP
}