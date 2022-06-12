module.exports = (userID, serverName, location) => {

    let getPassword = () => {
        const CAPSNUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var password = "";
        while (password.length < 10) {
            password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
        }
        return password;
    };


    return {
        "name": serverName,
        "user": userID,
        "nest": 11,
        "egg": 30,
        "docker_image": "quay.io/parkervcp/pterodactyl-images:db_redis",
        "startup": "redis-server --bind 0.0.0.0 --port {{SERVER_PORT}} --requirepass {{SERVER_PASSWORD}} --maxmemory {{SERVER_MEMORY}}mb --daemonize yes && redis-cli -p {{SERVER_PORT}} -a {{SERVER_PASSWORD}} && redis-cli -p {{SERVER_PORT}} -a {{SERVER_PASSWORD}} shutdown save",
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "environment": {
            "SERVER_PASSWORD": `${getPassword()}`
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