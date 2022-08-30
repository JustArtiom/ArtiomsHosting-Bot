module.exports = (userID, serverName, location) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 10,
        "egg": 41,
        "docker_image": "ghcr.io/software-noob/pterodactyl-images:nodejs_16",
        "startup": "cd ass && npm start",
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "environment": {
            "A_DOMAIN": "{HOST_AND_PORT}",
            "RESOURCE_ID_TYPE": "random",
            "DATA_ENGINE": "@tycrek/papito",
            "RESOURCE_ID_SIZE": "8",
            "MAX_UPLOAD": "100",
            "SPACE_REPLACE": "_",
            "MEDIA_STRICT": 1,
            "FRONTEND_NAME": "ass-x",
            "VIEW_DIRECT": 0
        },
        "feature_limits": {
            "databases": 2,
            "allocations": 1,
            "backups": 0
        },
        "deploy": {
            "locations": location,
            "dedicated_ip": false,
            "port_range": []
        },
        "start_on_completion": false
    }
}