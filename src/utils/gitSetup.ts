import { exec } from "node:child_process";
import config from "../../config";
import { log as consolelog } from "./console";
import chalk from "chalk";

export const runCommand = (cmd: string) => new Promise<string>((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
        if(error || stderr) return reject(error || stderr);
        return resolve(stdout);
    })
})

export const gitSetup = async ({ log }: { log?: boolean } = {}) => {
    await runCommand("git init").catch(() => {})
    if(log) consolelog("Initializing .git folder repository")
    
    await runCommand(`git remote add origin ${config.settings.autoUpdate.github}`)
    if(log) consolelog({name: "Github", description: `Remote origin set to ${config.settings.autoUpdate.github}`})

    await runCommand(`git checkout -b ${config.settings.autoUpdate.branch}`)
    if(log) consolelog({name: "Github", description: `${config.settings.autoUpdate.branch} branch added`})
    if(log) consolelog({name: "Github", description: `${chalk.green("Pass.")} git file has been successfully configured`})
}

export const gitPull = () => runCommand(`git pull origin ${config.settings.autoUpdate.branch}`)

if(process.argv[2] === "gitinit") {
    gitSetup({ log: true })
}