import { exec } from "node:child_process";
import config from "../../config";

export const gitPull = () => new Promise<{stdout: string, stderr: string}>((resolve, reject) => {
    exec(`git pull origin ${config.settings.autoUpdate.branch}`, (error, stdout, stderr) => {
        if(error) return reject(error);
        return resolve({stdout, stderr});
    })
});