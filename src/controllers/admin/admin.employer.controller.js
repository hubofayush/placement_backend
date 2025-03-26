import mongoose from "mongoose";
import { Employer } from "../../models/Employer.models/employer.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
// import csvParser from "csv-parser";
import fs from "fs";

// View all employers
const getAllEmployers = asyncHandler(async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            order = "desc",
        } = req.query;

        const employers = await Employer.find()
            .sort({ [sortBy]: order === "desc" ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .select("-password");

        if (!employers.length) throw new ApiError(404, "No employees found");

        return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    { employers, totalEmployees: employers.length },
                    "Employees fetched successfully",
                ),
            );
    } catch (error) {
        // Centralized error handling
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal server error";
        return res
            .status(statusCode)
            .json(new ApiResponce(statusCode, null, message));
    }
});

// get blocked employees
const getBlockedEmployers = asyncHandler(async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            order = "desc",
        } = req.query;

        const employers = await Employer.find({ isBlocked: true })
            .sort({ [sortBy]: order === "desc" ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .select("-password");

        if (!employers.length) throw new ApiError(404, "No employees found");

        return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    { employers, totalEmployees: employers.length },
                    "Employees fetched successfully",
                ),
            );
    } catch (error) {
        // Centralized error handling
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal server error";
        return res
            .status(statusCode)
            .json(new ApiResponce(statusCode, null, message));
    }
});

// view employer
const viewAdminSingleEmployer = asyncHandler(async (req, res) => {
    try {
        const { employerId } = req.params;
        if (!employerId) {
            throw new ApiError(400, "Company Id required");
        }

        if (!mongoose.Types.ObjectId.isValid(employerId)) {
            throw new ApiError(400, "Wrong id");
        }

        const company = await Employer.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(employerId),
                },
            },
            {
                $lookup: {
                    from: "jobapplications",
                    localField: "_id",
                    foreignField: "owner",
                    as: "applications",
                    pipeline: [
                        {
                            $match: {
                                active: true,
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "employersubscriptions",
                    localField: "subscription",
                    foreignField: "_id",
                    as: "subscriptions",
                },
            },
            {
                $project: {
                    name: 1,
                    location: 1,
                    email: 1,
                    applications: 1,
                    logo: 1,
                    authorityName: 1,
                    isBlocked: 1,
                    blockReason: 1,
                    subscriptions: 1,
                },
            },
        ]);

        if (company.length === 0) {
            throw new ApiError(400, "Invalid Id, Company Not Found");
        }

        return res
            .status(200)
            .json(new ApiResponce(200, company, "Company Found"));
    } catch (error) {
        // Centralized error handling
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal server error";
        return res
            .status(statusCode)
            .json(new ApiResponce(statusCode, null, message));
    }
});

// Delete an employer
const deleteEmployer = asyncHandler(async (req, res) => {
    try {
        const { employerId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(employerId))
            throw new ApiError(400, "Invalid Employer ID");

        const employer = await Employer.findByIdAndDelete(employerId);
        if (!employer) throw new ApiError(404, "Employer not found");

        return res
            .status(200)
            .json(new ApiResponce(200, {}, "Employer deleted successfully"));
    } catch (error) {
        // Centralized error handling
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal server error";
        return res
            .status(statusCode)
            .json(new ApiResponce(statusCode, null, message));
    }
});

// Block/Unblock Employer
const toggleEmployerStatus = asyncHandler(async (req, res) => {
    try {
        const { employerId } = req.params;
        const { reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(employerId))
            throw new ApiError(400, "Invalid Employer ID");

        const employer = await Employer.findById(employerId);
        if (!employer) throw new ApiError(404, "Employer not found");

        employer.isBlocked = !employer.isBlocked;
        employer.blockReason = reason || "No reason provided";
        await employer.save();

        const status = employer.isBlocked ? "blocked" : "unblocked";
        return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    employer,
                    `Employer ${status} successfully`,
                ),
            );
    } catch (error) {
        // Centralized error handling
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal server error";
        return res
            .status(statusCode)
            .json(new ApiResponce(statusCode, null, message));
    }
});

// // Bulk Upload Employers
// const bulkUploadEmployers = asyncHandler(async (req, res) => {
//     if (!req.file) throw new ApiError(400, "CSV file required for bulk upload");

//     const employers = [];
//     fs.createReadStream(req.file.path)
//         .pipe(csvParser())
//         .on("data", (data) => employers.push(data))
//         .on("end", async () => {
//             await Employer.insertMany(employers);
//             return res
//                 .status(200)
//                 .json(
//                     new ApiResponce(200, {}, "Employers uploaded successfully"),
//                 );
//         });
// });

// Restore Deleted Accounts
// const restoreDeletedEmployer = asyncHandler(async (req, res) => {
//     const { employerId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(employerId))
//         throw new ApiError(400, "Invalid Employer ID");

//     const employer = await Employer.findOne({ _id: employerId, deleted: true });
//     if (!employer) throw new ApiError(404, "Employer not found or not deleted");

//     employer.deleted = false;
//     await employer.save();

//     return res
//         .status(200)
//         .json(
//             new ApiResponce(
//                 200,
//                 employer,
//                 "Employer account restored successfully",
//             ),
//         );
// });

export {
    getAllEmployers,
    getBlockedEmployers,
    deleteEmployer,
    toggleEmployerStatus,
    viewAdminSingleEmployer,
    // bulkUploadEmployers,
    // restoreDeletedEmployer,
};
