export default (userID: string, serverName: string, location: number[]) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 5,
        "egg": 18,
        "docker_image": "ghcr.io/parkervcp/yolks:java_19",
        "startup": "java -Dterminal.jline=false -Dterminal.ansi=true -jar {{JARFILE}}",
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "environment": {
            "JARFILE": "sneakyhub.jar"
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