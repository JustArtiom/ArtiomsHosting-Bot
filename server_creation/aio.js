module.exports = (userID, serverName, location) => {
    console.log(location)
    return {
        "name": serverName,
        "user": userID,
        "nest": 8,
        "egg": 20,
        "docker_image": "danbothosting/aio",
        "startup": "{{STARTUP_CMD}}",
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "environment": {
            "STARTUP_CMD": "bash"
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