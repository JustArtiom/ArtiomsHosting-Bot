const consolelog = console.log
const fs = require('fs')
const moment = require('moment')
const name = moment().format("YYYY-MM-DD") + "_" + moment().format("HH:mm:ss")
module.exports=() =>{
    global.console.log = async function(string) {
        consolelog(string ? string : "")
        await fs.appendFileSync(`./logs/console.log/${name}.txt`, `${string ? string : ""}\n`);
    }
}