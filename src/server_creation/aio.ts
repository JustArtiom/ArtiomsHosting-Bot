export default (userID: string, serverName: string, location: number[], resources?: {cpu: number, ram: number, disk: number}) => ({
    "name": serverName,
    "user": userID,
    "nest": 5,
    "egg": 17,
    "docker_image": "danbothosting/aio",
    "startup": "{{STARTUP_CMD}}",
    "limits": {
        "memory": resources?.ram || 1024,
        "swap": 0,
        "disk": resources?.disk || 3072,
        "io": 500,
        "cpu": resources?.cpu || 0
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
})