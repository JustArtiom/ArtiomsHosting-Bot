import { exec } from "node:child_process";
import config from "../../config";
import { log as consolelog } from "./console";

export const runCommand = (cmd: string) => new Promise<string>((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
        if(error || stderr) return reject(error || stderr);
        return resolve(stdout);
    })
})

export const gitSetup = async ({ log }: { log?: boolean } = {}) => {
    const gitinit = await runCommand("git init").catch(() => {})
    if(log) consolelog("Initializing .git folder repository")
    
    if(!gitinit || gitinit.includes("Reinitialized existing Git repository in")) 
        throw new Error("You already have initialised git. If you want to reinitiate git please delte \".git\" folder")
    
    await runCommand(`git remote add origin ${config.settings.autoUpdate.github}`)
    await runCommand(`git checkout -b ${config.settings.autoUpdate.branch}`)
}

export const gitPull = () => runCommand(`git pull origin ${config.settings.autoUpdate.branch}`)

if(process.argv[2] === "gitinit") {
    gitSetup({ log: true })
}