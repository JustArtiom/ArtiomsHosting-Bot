function createtoken(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
    }
    return result;
}

module.exports = {
    name: "fakejoin",
    aliases: [],
    async run (client, message, args) {
        const token = createtoken(20)
        client.auth.set(message.author.id, token)
        message.author.send(`You will have to auth before accessing our server...\n this is your auth key: ||http://n1.artiom.host/auth/${message.author.id}/${token}||`)
    }
}