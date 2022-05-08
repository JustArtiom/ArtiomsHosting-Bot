const consolelog = console.log
const fs = require('fs')
const chalk = require('chalk')
const moment = require('moment')
const util = require('util')
const name = moment().format("YYYY-MM-DD") + "_" + moment().format("HH:mm:ss")
module.exports=() =>{
    global.console.log = async function(string) {
        consolelog(string ? typeof string === 'object' ? string : `${chalk.blueBright(`[ ${new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London' })} ] `)} ${string}` : "")
        await fs.appendFileSync(`./logs/console.log/${name}.txt`, `${string ? string : ""}\n`);
    }
}