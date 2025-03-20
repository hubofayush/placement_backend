import { blockedIPs } from "../constant.js";

// Middleware to block IPs
export const ipBlockerMiddleware = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    if (blockedIPs.has(clientIP)) {
        return res.status(403).json({
            success: false,
            message: "Access denied. Your IP address is blocked.",
        });
    }

    next();
};
