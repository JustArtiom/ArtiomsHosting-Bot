import chalk from "chalk";
import formatDate from "./formatDate";

type Log = string | {
    name: string;
    description: string;
}

export const log = (data: Log) => {
    let tolog = `${chalk.hex('#6b7dfb')(`[ ${formatDate(new Date())} ]`)} `;
    if(typeof data === "string") tolog += data
    else tolog += `${chalk.blueBright(`[ ${data.name} ]`)} ${data.description}`
    
    console.log(tolog);
}

export const warn = (data: Log) => {
    let tolog = `${chalk.hex('#6b7dfb')(`[ ${formatDate(new Date())} ]`)} `;
    if(typeof data === "string") tolog += `${chalk.hex('#ffcc00')('[ Warn ]')} ${data}`
    else tolog += `${chalk.blueBright(`[ ${data.name} ]`)} ${chalk.hex('#ffcc00')('[ Warn ]')} ${data.description}`
    
    console.log(tolog);
}

export const error = (data: Log) => {
    let tolog = `${chalk.hex('#6b7dfb')(`[ ${formatDate(new Date())} ]`)} `;
    if(typeof data === "string") tolog += `${chalk.red('[ Error ]')} ${data}`
    else tolog += `${chalk.blueBright(`[ ${data.name} ]`)} ${chalk.red('[ Error ]')} ${data.description}`
    
    console.log(tolog);
}