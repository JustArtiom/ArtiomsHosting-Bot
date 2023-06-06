import axios, { AxiosRequestConfig } from "axios";
import config from "../../config";

export default ({url, timeout, ...args}: AxiosRequestConfig) => axios({
    url: (config.ptero.url + url),
    timeout: (timeout || config.settings.timeout),
    ...args, 
    headers: {
        'Authorization': `Bearer ${url?.includes("/api/application") ? config.ptero.application : config.ptero.client}`,
        'Content-Type': 'application/json',
        'Accept': 'Application/vnd.pterodactyl.v1+json',
    }
}).then(x => x.data)