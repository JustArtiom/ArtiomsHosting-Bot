import { QuickDB } from "quick.db";
import { DBUser } from "./utils/types";

export const db = new QuickDB();
export const userData = db.table<DBUser>("userData");
export const chargesLogs = db.table<{
    timestamp: number, 
        price: {
        total: number;
        hourly: number;
        cpu: number;
        ram: number;
        disk: number;
    }, 
    discord_id: string,
    ptero_id: string | number,
    server_id: string,
    mount: number
}[]>("chargesLogs");
