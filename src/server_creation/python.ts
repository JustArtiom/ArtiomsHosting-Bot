export default (userID: string, serverName: string, location: number[]) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 5,
        "egg": 16,
        "docker_image": "ghcr.io/parkervcp/yolks:python_3.11",
        "startup": 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z {{PY_PACKAGES}} ]]; then pip install -U --prefix .local {{PY_PACKAGES}}; fi; if [[ -f /home/container/${REQUIREMENTS_FILE} ]]; then pip install -U --prefix .local -r ${REQUIREMENTS_FILE}; fi; /usr/local/bin/python /home/container/{{PY_FILE}}',
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
            "PY_FILE": "index.py",
            "REQUIREMENTS_FILE": "requirements.txt"
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