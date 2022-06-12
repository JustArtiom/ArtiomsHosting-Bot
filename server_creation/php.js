module.exports = (userID, serverName, location) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 13,
        "egg": 42,
        "docker_image": "quay.io/yajtpg/pterodactyl-images:php-8.1",
        "startup": "/start.sh",
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "environment": {
            "STARTUP_CMD": "php index.php"
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