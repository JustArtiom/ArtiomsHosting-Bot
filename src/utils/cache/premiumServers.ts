import config from "../../../config";
import { userData } from "../../db";
import { catchHandler } from "../console";
import WrapdactylSocket from "../pteroSocketManager";
import request from "../request";
import { setTimeout as wait } from "node:timers/promises"
export interface serverAttributes {
    id: number,
    external_id: null,
    uuid: string,
    identifier: string,
    name: string,
    description: string,
    status: null,
    suspended: boolean,
    limits: {
      memory: number,
      swap: number,
      disk: number,
      io: number,
      cpu: number,
      threads: null,
      oom_disabled: boolean
    },
    feature_limits: { databases: number, allocations: number, backups: number },
    user: number,
    node: number,
    allocation: number,
    nest: number,
    egg: number,
    container: any,
    updated_at: string,
    created_at: string
}

export interface Resources {
    cpu: number,
    ram: number,
    disk: number
}


class premiumServersClass {
    constructor(){}
    manualUpdatedCache = new Map<string, serverAttributes>()
    cache = new Map<string, serverAttributes>()

    updateCache = async () => {
        const premServers: any[] = [];
        
        for(let location of config.settings.locations.premium){
            await request({
                url: `/api/application/locations/${location}?include=servers`,
                method: "GET"
            }).then(d => premServers.push(...d?.attributes?.relationships?.servers.data))
            .catch(catchHandler("Cache"))
        }
        
        for (let server of premServers) {
            this.cache.set(server.attributes.identifier, server.attributes)
        }
    }

    updateCacheInterval = (interval: number) => {
        setInterval(() => {
            this.updateCache();
        }, interval)
    }

    calculatePrice = async (identifier: string | Resources) => {
        const server_limits: Resources | undefined = typeof identifier === "string" ? 
        await request({url: `/api/client/servers/${identifier}`}).then(x => ({
            cpu: x.attributes.limits.cpu,
            ram: x.attributes.limits.memory,
            disk: x.attributes.limits.disk,
        })).catch(() => undefined) :
        identifier;
        if(!server_limits) return

        const pricing = config.settings.pricing
        let price = {
            cpu: 0,
            ram: 0,
            disk: 0,
        }

        if(pricing.cpu.if_buy_over && pricing.cpu.if_buy_over <= server_limits.cpu / 100){
            price.cpu = server_limits.cpu / 100 * pricing.cpu.reduce_to
        } else {
            price.cpu = server_limits.cpu / 100 * pricing.cpu.price
        }

        if(pricing.ram.if_buy_over && pricing.ram.if_buy_over <= server_limits.ram / 1024){
            price.ram = server_limits.ram / 1024 * pricing.ram.reduce_to
        } else {
            price.ram = server_limits.ram / 1024 * pricing.ram.price
        }
        
        if(pricing.disk.if_buy_over && pricing.disk.if_buy_over <= server_limits.disk / 1024){
            price.disk = server_limits.disk / 1024 * pricing.disk.reduce_to
        } else {
            price.disk = server_limits.disk / 1024 * pricing.disk.price
        }

        return {
            ...price, 
            total: price.cpu + price.ram + price.disk, 
            hourly: (price.cpu + price.ram + price.disk)/30/24
        }
    }

    monitorCharges = async () => {
        if(!this.cache.size) return
        const unconnected_servers = Array.from(this.cache.values()).filter(x => !this.manualUpdatedCache.get(x.identifier))
        
        for(let server of unconnected_servers) {
            const ws = new WrapdactylSocket(config.ptero, server.identifier);

            let onlineSince: number | undefined = undefined;
            let interval: NodeJS.Timer | undefined;

            ws.on("status", async (status: string) => {
                const user = (await userData.all()).filter(({value}) => value.pteroid === server.user)[0]
                const price = await this.calculatePrice({cpu: server.limits.cpu, ram: server.limits.memory, disk: server.limits.disk})
                
                if(!user) return
                if(user?.value.balance <= 0 && ["running", "stopping", "starting"].includes(status)) {
                    await wait(100)
                    ws.sendCommand("You have ran out of funds so you will not be able to use this server unless you top-up. Thanks, ArtiomsHosting");
                    ws.power("kill");
                    return
                }

                if(status === "running") {
                    onlineSince = Date.now();
                    interval = setInterval(async () => {
                        userData.sub(user?.id+".balance", price?.hourly || 0)
                        onlineSince = Date.now()

                        if((await userData.get(user.id))?.balance || 1 <= 0) {
                            clearInterval(interval)
                            interval=undefined
                            ws.power("kill");
                            return
                        }
                    }, 3_600_000)
                    return 
                }
                if(!onlineSince || !price) return
                if(interval) {
                    clearInterval(interval)
                    interval = undefined;
                }

                const howlong = (Date.now() - onlineSince) / 3_600_000;
                const cost = howlong * price?.hourly
                userData.sub(user?.id+".balance", cost)

                onlineSince = undefined
            })
            ws.connect().catch(catchHandler("WS"));
        }
    }
}


export const premiumServers = new premiumServersClass();