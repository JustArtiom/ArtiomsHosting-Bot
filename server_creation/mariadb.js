module.exports = (userID, serverName, location) => {

    return {
        "name": serverName,
        "user": userID,
        "nest": 11,
        "egg": 32,
        "docker_image": "quay.io/parkervcp/pterodactyl-images:db_mariadb",
        "startup": "{ /usr/sbin/mysqld & } && sleep 5 && mysql -u root",
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "environment": {

        },
        "feature_limits": {
            "databases": 2,
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