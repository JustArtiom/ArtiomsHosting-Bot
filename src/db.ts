import { QuickDB } from "quick.db";
import { DBUser } from "./utils/types";

export const db = new QuickDB();
export const userData = db.table<DBUser>("userData");