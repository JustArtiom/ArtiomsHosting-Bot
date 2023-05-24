import nodemailer from "nodemailer";
import config from "../config";

export default config.mail.enabled ? nodemailer.createTransport(config.mail) : null