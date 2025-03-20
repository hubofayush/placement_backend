import logger from "../utils/logger.js";

const logClientIP = (req, res, next) => {
    const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Capture request start time
    const startTime = Date.now();

    // Capture status after response is sent
    res.on("finish", () => {
        const duration = Date.now() - startTime; // Response time
        const statusCode = res.statusCode;

        if (statusCode >= 200 && statusCode < 400) {
            logger.info(
                `[SUCCESS] ${req.method} ${req.url} | IP: ${clientIP} | Status: ${statusCode} | Duration: ${duration}ms`,
            );
        } else {
            logger.error(
                `[FAILED] ${req.method} ${req.url} | IP: ${clientIP} | Status: ${statusCode} | Duration: ${duration}ms`,
            );
        }
    });

    next(); // Continue to the next middleware or route handler
};

export default logClientIP;
