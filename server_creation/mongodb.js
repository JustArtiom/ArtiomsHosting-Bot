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
        "egg": 40,
        "docker_image": "ghcr.io/parkervcp/yolks:mongodb_4",
        "startup": "mongod --fork --dbpath /home/container/mongodb/ --port ${SERVER_PORT} --bind_ip 0.0.0.0 --logpath /home/container/logs/mongo.log; until nc -z -v -w5 127.0.0.1 ${SERVER_PORT}; do echo 'Waiting for mongodb connection...'; sleep 5; done && mongo 127.0.0.1:${SERVER_PORT} && mongo --eval \"db.getSiblingDB('admin').shutdownServer()\" 127.0.0.1:${SERVER_PORT}",
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "environment": {
            "MONGO_USER": "admin",
            "MONGO_USER_PASS": `${getPassword()}`
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