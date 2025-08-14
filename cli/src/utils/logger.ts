import winston from "winston";
import { inputs } from "./args";

// Create transports array - always include console
const transports: winston.transport[] = [
    new winston.transports.Console({
        level: inputs.verbose ? "debug" : "info",
        format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.simple()),
    }),
];

// Create the logger instance
export const logger = winston.createLogger({
    level: "info",
    transports,
});
