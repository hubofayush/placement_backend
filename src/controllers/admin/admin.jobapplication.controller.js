import mongoose from "mongoose";
import { JobApplication } from "../../models/Employer.models/jobApplication.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// View all job applications
const getAllJobApplications = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
    } = req.query;

    const jobApplications = await JobApplication.find()
        .sort({ [sortBy]: order === "desc" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    if (!jobApplications.length)
        throw new ApiError(404, "No job applications found");

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                jobApplications,
                "Job applications fetched successfully",
            ),
        );
});

// Change Application Status (Approved, Rejected, etc.)
const changeApplicationStatus = asyncHandler(async (req, res) => {
    const { jobApplicationID } = req.params;

    if (!jobApplicationID) {
        throw new ApiError(400, "Application ID required");
    }

    if (!mongoose.Types.ObjectId.isValid(jobApplicationID)) {
        throw new ApiError(400, "Invalid ID");
    }

    // const validStatuses = ["Pending", "Approved", "Rejected", "On Hold"];
    // if (!validStatuses.includes(status))
    //     throw new ApiError(400, "Invalid status value");

    const application = await JobApplication.findById(jobApplicationID);
    if (!application) throw new ApiError(404, "Job application not found");

    application.active = !application.active;
    await application.save({ validateBeforeSave: false });

    const status = application.active ? "active" : "Blocked";
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                application,
                `Application status changed to ${status}`,
            ),
        );
});

// View Active Applications
const getActiveApplications = asyncHandler(async (req, res) => {
    const activeApplications = await JobApplication.find({ active: true });
    if (!activeApplications.length)
        throw new ApiError(404, "No active applications found");

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                activeApplications,
                "Active applications fetched successfully",
            ),
        );
});
// View deActive Applications
const getDeactiveApplications = asyncHandler(async (req, res) => {
    const activeApplications = await JobApplication.find({ active: false });
    if (!activeApplications.length)
        throw new ApiError(404, "No deactive applications found");

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                activeApplications,
                "deactive applications fetched successfully",
            ),
        );
});

const viewAdminSingleJobApplication = asyncHandler(async (req, res) => {
    const { jobApplicationID } = req.params;
    if (!jobApplicationID) {
        throw new ApiError(400, "Job application id required");
    }

    if (!mongoose.Types.ObjectId.isValid(jobApplicationID)) {
        throw new ApiError(400, "invalid jobapplication id");
    }

    const jobApplicationRequests = await JobApplication.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(jobApplicationID),
            },
        },
        {
            $lookup: {
                from: "shortlistedapplications",
                localField: "_id",
                foreignField: "jobApplication",
                as: "shortListedApplications",
                pipeline: [
                    {
                        $lookup: {
                            from: "applications",
                            localField: "application",
                            foreignField: "_id",
                            as: "application",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "employees",
                                        localField: `employee`,
                                        foreignField: "_id",
                                        as: "employees",
                                        pipeline: [
                                            {
                                                $project: {
                                                    fName: 1,
                                                    lName: 1,
                                                    phone: 1,
                                                    age: 1,
                                                    avatar: 1,
                                                    leades: 1,
                                                    education: 1,
                                                    isBlocked: 1,
                                                    blockReason: 1,
                                                    dateOfBirth: 1,
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "applications",
                localField: "_id",
                foreignField: "jobApplication",
                as: "applications",
                pipeline: [
                    {
                        $lookup: {
                            from: "employees",
                            localField: `employee`,
                            foreignField: "_id",
                            as: "employees",
                            pipeline: [
                                {
                                    $project: {
                                        fName: 1,
                                        lName: 1,
                                        phone: 1,
                                        age: 1,
                                        avatar: 1,
                                        leades: 1,
                                        education: 1,
                                        isBlocked: 1,
                                        blockReason: 1,
                                        dateOfBirth: 1,
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ]);

    if (jobApplicationRequests.length === 0) {
        throw new ApiError(400, "No job application found");
    }

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                jobApplicationRequests,
                "Job application found successfully",
            ),
        );
});

export {
    getAllJobApplications,
    changeApplicationStatus,
    getActiveApplications,
    getDeactiveApplications,
    viewAdminSingleJobApplication,
};
