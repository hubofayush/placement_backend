import { DB_NAME } from "../../constant.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { exec } from "child_process";
import os from "os";
// Database Backup
const databaseBackup = asyncHandler(async (req, res) => {
    exec(
        `mongodump --uri=${process.env.MONGO_URL}${DB_NAME} --out=./backup`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Backup Error: ${stderr}`);
                throw new ApiError(500, `Database backup failed:${error}`);
            }
            return res
                .status(200)
                .json(new ApiResponce(200, {}, "Database backup successful"));
        },
    );
});

// Database Restore
const databaseRestore = asyncHandler(async (req, res) => {
    exec(
        "mongorestore --uri='your_mongodb_connection_uri' ./backup",
        (error, stdout, stderr) => {
            if (error)
                return res
                    .status(500)
                    .json(new ApiError(500, "Database restore failed"));
            return res
                .status(200)
                .json(new ApiResponce(200, {}, "Database restore successful"));
        },
    );
});

// Server Health Monitoring
const getServerHealth = asyncHandler(async (req, res) => {
    const healthData = {
        uptime: os.uptime(),
        freeMemory: os.freemem(),
        totalMemory: os.totalmem(),
        cpuLoad: os.loadavg(),
    };

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                healthData,
                "Server health data fetched successfully",
            ),
        );
});

export { databaseBackup, databaseRestore, getServerHealth };
