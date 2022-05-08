module.exports = (userID, serverName, location) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 10,
        "egg": 36,
        "docker_image": "quay.io/parkervcp/pterodactyl-images:debian_nodejs-12",
        "startup": "/usr/local/bin/node /home/container/src/index.js",
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "environment": {
            
        },
        "feature_limits": {
            "databases": 0,
            "allocations": 1,
            "backups": 0
        },
        "deploy": {
            "locations": [location],
            "dedicated_ip": false,
            "port_range": []
        },
        "start_on_completion": false
    }
}