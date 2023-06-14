export default (userID: string, serverName: string, location: number[]) => ({
    "name": serverName,
    "user": userID,
    "nest": 7,
    "egg": 23,
    "docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
    "startup": "sh .local/lib/code-server-{{VERSION}}/bin/code-server",
    "limits": {
        "memory": 1024,
        "swap": 0,
        "disk": 3072,
        "io": 500,
        "cpu": 0
    },
    "environment": {
        "PASSWORD": `${(Math.random() + 1).toString(36).substring(2)}`,
        "VERSION": "latest"
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
})