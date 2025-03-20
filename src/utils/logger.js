import winston from "winston";

// Create Winston Logger instance
const logger = winston.createLogger({
    level: "info", // Log level (info, warn, error, etc.)
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        }),
    ),
    transports: [
        new winston.transports.Console(), // Logs in console
        new winston.transports.File({ filename: "logs/logsInfo.log" }), // Save logs in a file
    ],
});

export default logger;
