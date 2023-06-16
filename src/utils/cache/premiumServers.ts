import config from "../../../config";
import { chargesLogs, userData } from "../../db";
import { catchHandler, error, log } from "../console";
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
    connectedServersCache = new Map<string, serverAttributes>()
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
        
        if(!premServers.length) throw "No premium servers detected on the premium node";

        for (let server of premServers) {
            this.cache.set(server.attributes.identifier, server.attributes)
        }
    }

    setInterval = (interval: number) => setInterval(async () => {
        await this.updateCache().catch(() => {});
        await this.monitorCharges().catch(() => {});
    }, interval)
    

    calculatePrice = (server_limits: Resources) => {
        const pricing = config.settings.pricing
        let price = {
            cpu: server_limits.cpu / 100 * pricing.cpu.price,
            ram: server_limits.ram / 1024 * pricing.ram.price,
            disk: server_limits.disk / 1024 * pricing.disk.price,
        }

        if(pricing.cpu.if_buy_over && pricing.cpu.if_buy_over <= server_limits.cpu / 100){
            price.cpu = server_limits.cpu / 100 * pricing.cpu.reduce_to
        }

        if(pricing.ram.if_buy_over && pricing.ram.if_buy_over <= server_limits.ram / 1024){
            price.ram = server_limits.ram / 1024 * pricing.ram.reduce_to
        }
        
        if(pricing.disk.if_buy_over && pricing.disk.if_buy_over <= server_limits.disk / 1024){
            price.disk = server_limits.disk / 1024 * pricing.disk.reduce_to
        }

        return {
            ...price, 
            total: price.cpu + price.ram + price.disk, 
            hourly: (price.cpu + price.ram + price.disk)/30/24
        }
    }

    monitorCharges = async () => {
        if(!this.cache.size) return error({name: " $ ", description: "Cache is not ready"})
        const unconnected_servers = Array.from(this.cache.values()).filter(x => !this.connectedServersCache.get(x.identifier))
        
        for(let server of unconnected_servers) {
            this.connectedServersCache.set(server.identifier, server)
            const ws = new WrapdactylSocket(config.ptero, server.identifier);

            let onlineSince: number | undefined = undefined;
            let interval: NodeJS.Timer | undefined;
            ws.on("connect", async() => {
                log({name: " $ ", description: `${server.identifier} - Connected and charging ($${(this.calculatePrice({
                    cpu: server.limits.cpu,
                    ram: server.limits.memory,
                    disk: server.limits.disk
                })).hourly.toFixed(6)} / h)`})
            });

            ws.on("status", async (status: string) => {
                const user = (await userData.all()).filter(({value}) => value.pteroid === server.user)[0]
                const price = this.calculatePrice({cpu: server.limits.cpu, ram: server.limits.memory, disk: server.limits.disk})
                
                if(!user) return
                if(user.value.balance <= 0 && ["running", "stopping", "starting"].includes(status)) {
                    await wait(100);
                    ws.sendCommand("You have ran out of funds so you will not be able to use this server unless you top-up. Thanks, ArtiomsHosting");
                    ws.power("kill");
                    return
                }

                const userLog = await chargesLogs.get(user.id)

                if(status === "running") {
                    onlineSince = Date.now();
                    interval = setInterval(async () => {
                        const userr = await userData.get(user.id);
                        if(!userr) return
                        
                        userData.sub(userr.discordid+".balance", price.hourly)
                        if(!userLog?.length) chargesLogs.set(userr.discordid, [{
                            timestamp: Date.now(), 
                            price: price, 
                            discord_id: userr.discordid,
                            ptero_id: userr.pteroid,
                            server_id: server.identifier, 
                            amount: price.hourly
                        }])
                        else chargesLogs.set(userr.discordid, [...userLog, {
                            timestamp: Date.now(), 
                            price: price, 
                            discord_id: userr.discordid,
                            ptero_id: userr.pteroid,
                            server_id: server.identifier, 
                            amount: price.hourly
                        }])
                        onlineSince = Date.now()

                        if(userr.balance <= 0) {
                            clearInterval(interval)
                            interval=undefined
                            ws.power("kill");
                            return
                        }
                    }, 3_600_000)
                    return 
                }
                if(!onlineSince) return
                if(interval) {
                    clearInterval(interval)
                    interval = undefined;
                }

                const howlong = (Date.now() - onlineSince) / 3_600_000;
                const cost = howlong * price?.hourly

                userData.sub(user.id+".balance", cost)
                if(!userLog?.length) chargesLogs.set(user.id, [{
                    timestamp: Date.now(), 
                    price: price, 
                    discord_id: user.id,
                    ptero_id: user.value.pteroid,
                    server_id: server.identifier, 
                    amount: cost
                }])
                else chargesLogs.set(user.id, [...userLog, {
                    timestamp: Date.now(), 
                    price: price, 
                    discord_id: user.id,
                    ptero_id: user.value.pteroid,
                    server_id: server.identifier, 
                    amount: cost
                }])
                onlineSince = undefined
            })

            ws.on("tokenExpired", () => {
                error({name: " $ ", description: `${server.identifier} - Token expired`})
            })

            ws.on("deleted", () => {
                log({name: " $ ", description: `${server.identifier} - Server Deleted`})
                this.cache.delete(server.identifier);
                this.connectedServersCache.delete(server.identifier);
            });

            ws.on("error", () => {})
            ws.on("disconnect", async () => {
                ws.emit("status", "offline");
                await wait(10_000)
                if(this.connectedServersCache.get(server.identifier)) ws.connect().catch(() => {})
            });

            ws.connect().catch(catchHandler(" $ "));
        }
    }
}


export const premiumServers = new premiumServersClass();
