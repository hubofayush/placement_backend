import logger from "../utils/logger.js"; // Import logger

const logClientIP = (req, res, next) => {
    const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    logger.info(`Request from IP: ${clientIP} - ${req.method} ${req.url}`);

    next(); // Continue to the next middleware or route handler
};

export default logClientIP;
