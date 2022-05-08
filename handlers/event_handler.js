const fs = require('fs')
module.exports = (client) => {
    const event_files = fs.readdirSync(`./events/`).filter(file => file.endsWith('.js'));
    for(const file of event_files){
        const event = require(`../events/${file}`);
        const event_name = file.split('.')[0];
        client.on(event_name, event.bind(null, client))
    }
}
