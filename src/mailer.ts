import nodemailer from "nodemailer";
import config from "../config";

export default nodemailer.createTransport(config.mail || {})