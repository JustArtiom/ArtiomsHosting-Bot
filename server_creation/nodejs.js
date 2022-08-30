module.exports = (userID, serverName, location) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 8,
        "egg": 18,
        "docker_image": "ghcr.io/parkervcp/yolks:nodejs_17",
        "startup": 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/node /home/container/{{BOT_JS_FILE}}',
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },  
        "environment": {
            "USER_UPLOAD": 0,
            "AUTO_UPDATE": 0,
            "BOT_JS_FILE": "index.js"
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