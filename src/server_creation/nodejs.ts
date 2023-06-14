export default (userID: string, serverName: string, location: number[], resources?: {cpu: number, ram: number, disk: number}) => ({
    "name": serverName,
    "user": userID,
    "nest": 5,
    "egg": 15,
    "docker_image": "ghcr.io/parkervcp/yolks:nodejs_19",
    "startup": `if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z \${NODE_PACKAGES} ]]; then /usr/local/bin/npm install \${NODE_PACKAGES}; fi; if [[ ! -z \${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall \${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/node /home/container/{{JS_FILE}}`,
    "limits": {
        "memory": resources?.ram || 1024,
        "swap": 0,
        "disk": resources?.disk || 3072,
        "io": 500,
        "cpu": resources?.cpu || 0
    },  
    "environment": {
        "USER_UPLOAD": 0,
        "AUTO_UPDATE": 0,
        "JS_FILE": "index.js"
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