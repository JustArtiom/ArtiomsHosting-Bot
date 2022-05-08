module.exports = (userID, serverName, location) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 8,
        "egg": 39,
        "docker_image": "quay.io/parkervcp/pterodactyl-images:bot_red",
        "startup": "PATH=$PATH:/home/container/.local/bin redbot pterodactyl --token {{TOKEN}} --prefix {{PREFIX}}",
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "environment": {
            "TOKEN": "Your_bot_token_here",
            "PREFIX": "."
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