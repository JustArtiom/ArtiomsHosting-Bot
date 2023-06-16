/*
    This script is taken from the wrapdactyl repo and modified.
    https://github.com/JustArtiom/wrapdactyl
    Please respect its licence
*/

import { EventEmitter } from 'events';
import WebSocket from "ws";
import request from "./request";

interface serverWebsocketManagerEvents {
    "connect": () => any;
    "authentication": () => any;
    "error": (data: string) => any;
    "disconnect": () => any;
    "tokenExpired": () => any;
    "daemonMessage": (message: string) => any;
    "installMessage": (message: string) => any;
    "installStarted": () => any;
    "installCompleted": () => any;
    "console": (message: string) => any;
    "status": (message: string) => any;
    "stats": (data: {
        cpu_absolute: number,
        disk_bytes: number,
        memory_bytes: number,
        memory_limit_bytes: number,
        network: {rx_bytes: number, tx_bytes: number},
        state: string,
        uptime: number
    }) => any;
    "backupRestoreCompleted": () => any;
    "backupCompleted": () => any;
    "transferLogs": (message: string) => any;
    "transferStatus": (data: string) => any;
    "deleted": () => any;
    "daemonError": (message: string) => any;
}


declare interface WrapdactylSocket {
    on<U extends keyof serverWebsocketManagerEvents>(
      event: U, listener: serverWebsocketManagerEvents[U]
    ): this;
  
    emit<U extends keyof serverWebsocketManagerEvents>(
      event: U, ...args: Parameters<serverWebsocketManagerEvents[U]>
    ): boolean;
}

class WrapdactylSocket extends EventEmitter {
    constructor(config: {url: string, client: string, application: string}, id: string) {
        super();

        Object.defineProperty(this, "config", { enumerable: false });
        this.config.origin = config.url;
        this.identifier = id;
    }

    ws?: WebSocket;
    identifier = "";
    config = { 
        socket: "",
        token: "", 
        origin: ""
    };

    connect = async () => {
        if(this.ws) throw new Error("Wrapdactyl - the websocket is still in connected state")

        const creds = await request({
            url: `/api/client/servers/${this.identifier}/websocket`,
            method: "GET"
        });
        
        this.config.socket = creds.data.socket
        this.config.token = creds.data.token

        this.ws = new WebSocket(this.config.socket, { origin: this.config.origin });

        this.ws.on("open", () => {
            this.auth(this.config.token);
            this.emit("connect");
        })

        this.ws.on('message', async (data) => {
            let message = JSON.parse(data.toString())
            if(message.event === 'auth success') {
                this.emit("authentication")
            } else if(message.event === 'daemon message') {
                for(let arg of message.args) this.emit('daemonMessage', arg)
            } else if(message.event === 'install output') {
                for(let arg of message.args) this.emit('installMessage', arg)
            } else if(message.event === 'install started') {
                this.emit("installStarted")
            } else if(message.event === 'install completed') {
                this.emit("installCompleted")
            } else if(message.event === 'console output') {
                message.args = message.args.map((x: string) => x.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''))
                for(let arg of message.args) this.emit('console', arg)
            } else if(message.event === 'status') {
                for(let arg of message.args) this.emit('status', arg)
            } else if(message.event === 'stats') {
                message.args = message.args.map((x: string) => JSON.parse(x))
                for(let arg of message.args) this.emit('stats', arg);
            } else if(message.event === 'backup restore completed') {
                this.emit("backupRestoreCompleted")
            } else if(message.event === 'backup completed') {
                this.emit("backupCompleted")
            } else if(message.event === 'transfer logs') {
                for(let arg of message.args) this.emit('transferLogs', arg);
            } else if(message.event === 'transfer status') {
                for(let arg of message.args) this.emit('transferStatus', arg);
            } else if(message.event === 'deleted') {
                this.emit('deleted');
            } else if(message.event === 'token expiring') {
                const creds = await request({
                    url: `/api/client/servers/${this.identifier}/websocket`,
                    method: "GET"
                }).catch(() => {});
                if(creds) this.auth(creds.data.token);
            } else if(message.event === 'token expired') {
                this.emit("tokenExpired")
            } else if(message.event === 'daemon error') {
                for(let arg of message.args) this.emit("daemonError", arg)
            } else if(message.event === 'jwt error') {
                for(let arg of message.args) this.emit("error", arg)
            } else console.log(message) // Testing stage
        });
        this.ws.on('error', (data) => this.emit("error", data.toString()))
        this.ws.on('close', async () => {
            this.ws = undefined
            this.emit("disconnect")
        })

        return {
            awaitConnection: (): Promise<string> => new Promise((resolve, _) => {
                this.ws?.once("open", () => resolve("connected"))
            }),
            awaitAuth: (): Promise<string> => new Promise((resolve, _) => {
                this.ws?.on('message', async (data) => {
                    let message = JSON.parse(data.toString())
                    if(message.event === 'auth success') {
                        resolve("authenticated")
                    }
                })
            })
        }
    }
    
    disconnect = this.ws?.close;

    auth = (token?: string) => {
        if(!token) return false
        if(!this.ws) throw new Error("Wrapdactyl - the websocket is not connected yet")

        this.ws.send(JSON.stringify({"event": "auth", "args": [token]}))
        return true
    }

    requestStats = () => 
        this.ws?.send(JSON.stringify({"event": "send stats", "args": [null]}))
    

    requestLogs = () => 
        this.ws?.send(JSON.stringify({"event": "send logs", "args": [null]}))
    

    power = (power: "start" | "stop" | "restart" | "kill") => {
        if(!["start", "stop", "restart", "kill"].includes(power.toLowerCase())) throw new Error("Wrapdactyl - Invalid power method");
        this.ws?.send(JSON.stringify({"event": "set state", "args": [power]}))
    }
    
    sendCommand = (command: string) => 
        this.ws?.send(JSON.stringify({"event": "send command", "args": [command]}))
    
}

export default WrapdactylSocket;