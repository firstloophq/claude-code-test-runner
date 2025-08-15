import winston from "winston";
import { inputs } from "./args";

// Create transports array - always include console
const transports: winston.transport[] = [
    new winston.transports.Console({
        level: inputs.verbose ? "debug" : "info",
        format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.simple()),
    }),
    new winston.transports.File({
        filename: `${inputs.resultsPath}/debug.log`,
        level: "debug",
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
];

// Create the logger instance
export const logger = winston.createLogger({
    level: "info",
    transports,
});
