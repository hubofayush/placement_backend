import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { JobApplication } from "../../models/Employer.models/jobApplication.model.js";
import mongoose, { mongo, Mongoose } from "mongoose";
import { Application } from "../../models/Employee.models/application.model.js";
import { uploadOnCloudinaryPDF } from "../../utils/cloudinary.js";
import fs from "fs";
import { ShortlistedApplication } from "../../models/Employer.models/shortlistedApplication.model.js";

// get all aplications //
const getAllApplications = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy, sortType } = req.query;

        const parsedLimit = parseInt(limit);
        const pageSkip = (page - 1) * parsedLimit;
        const sortStage = {};
        sortStage[sortBy] = sortType === "asc" ? 1 : -1;

        const applications = await JobApplication.find({ active: true })
            .select("-owner")
            .sort(sortStage)
            .skip(pageSkip)
            .limit(parsedLimit);
        if ((applications, length)) {
            throw new ApiError(404, "No applications found");
        }

        return res
            .status(200)
            .json(new ApiResponce(200, applications, "All applications"));
    } catch (error) {
        // Centralized error handling
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal server error";
        return res
            .status(statusCode)
            .json(new ApiResponce(statusCode, null, message));
    }
});
// end of get all aplications //

// post application for job //
const postApplication = asyncHandler(async (req, res) => {
    try {
        const { jobId } = req.params;
        const { bid } = req.body;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            throw new ApiError(400, "Invalid job id");
        }

        if (!jobId) {
            throw new ApiError(400, "job id needed");
        }

        // checking if employer applicarion is already present //
        // const oldApplication = await Application.find({
        //     employee: new mongoose.Types.ObjectId(req.employee._id),
        //     jobApplication: jobId,
        // });

        // if (oldApplication) {
        //     fs.unlinkSync(resumeLocalPath);
        //     throw new ApiError(400, "Cant Upload multiple Application");
        // }
        // end of checking if employer applicarion is already present //

        if (!bid) {
            throw new ApiError(400, "bid is required");
        }

        const job = await JobApplication.findById(jobId);

        if (!job) {
            throw new ApiError(404, "No job found");
        }

        // console.log(req.employee);
        const newApplication = await Application.create({
            employee: new mongoose.Types.ObjectId(req.employee._id),
            bid: bid,
            jobApplication: jobId,
            pdfData: {
                name: req.file?.originalname,
                data: req.file?.buffer,
                contentType: "application/pdf",
            },
        });

        await job.applications.push(newApplication._id);
        await job.save({ validateBeforeSave: false });

        if (!newApplication) {
            throw new ApiError(400, "Application failed");
        }

        return res
            .status(201)
            .json(
                new ApiResponce(
                    201,
                    newApplication,
                    "Application posted successful",
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
// end of post application for job //

// view job application //
const viewJobApplication = asyncHandler(async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            throw new ApiError(400, "Job Application Id Required");
        }

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            throw new ApiError(400, "Invalid Id");
        }

        // const newJobApplication =
        //     await JobApplication.findById(jobId).select("-active -owner ");

        const newJobApplication = await JobApplication.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(jobId),
                },
            },

            {
                $lookup: {
                    from: "applications",
                    localField: "applications",
                    foreignField: "_id",
                    as: "result",
                    pipeline: [
                        {
                            $lookup: {
                                from: "employees",
                                localField: "employee",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fName: 1,
                                            lName: 1,
                                            avatar: 1,
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        ]);

        if (newJobApplication.length === 0) {
            throw new ApiError(400, "Job Application not found");
        }

        return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    newJobApplication[0],
                    "Job Application found Successfully",
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
// end of view job application //

// view posted applications //
const viewMyApplications = asyncHandler(async (req, res) => {
    try {
        // const jobApplications = await Application.find({
        //     employee: req.employee?._id,
        // });

        // updating controller //
        const jobApplications = await Application.aggregate([
            {
                $match: {
                    employee: req.employee?._id,
                },
            },
            {
                $lookup: {
                    from: "jobapplications",
                    localField: "jobApplication",
                    foreignField: "_id",
                    as: "jobApplicatIonInfo",
                    pipeline: [
                        {
                            $project: {
                                companyName: 1,
                                title: 1,
                            },
                        },
                    ],
                },
            },
        ]);
        // end of updating controller //

        if (jobApplications.length === 0) {
            return res
                .status(200)
                .json(new ApiResponce(200, [], "No Application Found"));
        }

        return res
            .status(200)
            .json(new ApiResponce(200, jobApplications, "Applications Found"));
    } catch (error) {
        // Centralized error handling
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal server error";
        return res
            .status(statusCode)
            .json(new ApiResponce(statusCode, null, message));
    }
});
// end of view posted applications //

// view single application //
const viewSingleApplication = asyncHandler(async (req, res) => {
    try {
        const { applicationId } = req.params;
        if (!applicationId) {
            throw new ApiError(400, "Application ID required");
        }

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ApiError(400, "Invalid Id");
        }

        const applicationInfo = await Application.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(applicationId),
                },
            },
            {
                $lookup: {
                    from: "jobapplications",
                    localField: "jobApplication",
                    foreignField: "_id",
                    as: "jobApplicationInfo",
                    pipeline: [
                        {
                            $project: {
                                companyName: 1,
                                owner: 1,
                                title: 1,
                                description: 1,
                                openings: 1,
                                location: 1,
                                jobType: 1,
                                qualification: 1,
                                jobHours: 1,
                                instructions: 1,
                                contactInfo: 1,
                                closeDate: 1,
                                appliacations: 1,
                            },
                        },
                    ],
                },
            },
        ]);

        if (applicationInfo.length === 0) {
            throw new ApiError(401, "Application Not Found or Try again");
        }

        return res.status(200).json(
            new ApiResponce(
                200,
                {
                    applicationInfo: applicationInfo[0],
                    jobApplicationInfo:
                        applicationInfo[0].jobApplicationInfo[0],
                },
                "Application Found Successfull",
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
// end of view single application //

// update application //
const updateApplicationBid = asyncHandler(async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { bid } = req.body;

        if (!applicationId) {
            throw new ApiError(400, "Application id required");
        }

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ApiError(400, "invalid id");
        }

        const foundApplication = await Application.findById(applicationId);

        if (!foundApplication) {
            throw new ApiError(401, "application not found");
        }

        if (!foundApplication.employee.equals(req.employee?._id)) {
            throw new ApiError(400, "Owner not matched");
        }
        if (!bid) {
            throw new ApiError(400, "bid required");
        }

        foundApplication.bid = bid || foundApplication.bid;
        foundApplication.pdfData = {
            name: req.file?.originalname || foundApplication.pdfData.name,
            data: req.file?.buffer ?? foundApplication.pdfData.data,
            contentType: "application/pdf",
        };
        await foundApplication.save({ validateBeforeSave: false });

        if (!foundApplication) {
            throw new ApiError(400, "cant update appliation");
        }

        const applicationInfo = await Application.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(applicationId),
                },
            },
            {
                $lookup: {
                    from: "jobapplications",
                    localField: "jobApplication",
                    foreignField: "_id",
                    as: "jobApplicationInfo",
                    pipeline: [
                        {
                            $project: {
                                companyName: 1,
                                owner: 1,
                                title: 1,
                                description: 1,
                                openings: 1,
                                location: 1,
                                jobType: 1,
                                qualification: 1,
                                jobHours: 1,
                                instructions: 1,
                                contactInfo: 1,
                                closeDate: 1,
                                appliacations: 1,
                            },
                        },
                    ],
                },
            },
        ]);

        if (applicationInfo.length === 0) {
            throw new ApiError(401, "Application Not Found or Try again");
        }
        return res
            .status(200)
            .json(
                new ApiResponce(200, applicationInfo, "updated successfully"),
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
// end of update application //

// delete applicaiton //
const deletedApplication = asyncHandler(async (req, res) => {
    try {
        // 1. Extract and validate applicationId from params
        const { applicationId } = req.params;
        if (!applicationId) {
            throw new ApiError(400, "Application ID is required");
        }

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ApiError(400, "Invalid application ID format");
        }

        // 2. Find the application by ID
        const applicationFound =
            await Application.findById(applicationId).exec();
        if (!applicationFound) {
            throw new ApiError(404, "No application found with this ID");
        }

        const shortlistedData = await ShortlistedApplication.findOneAndDelete({
            application: applicationFound._id,
        });
        if (!shortlistedData) {
            throw new ApiError(404, "no Shortlisted application found");
        }

        // 3. Find the associated JobApplication and update its applications array
        const jobApplication = await JobApplication.findById(
            applicationFound.jobApplication,
        ).exec();
        if (!jobApplication) {
            throw new ApiError(404, "Associated job application not found");
        }

        // 4. Remove the application ID from the applications array
        const updatedApplications = jobApplication.applications.filter(
            (appId) => appId.toString() !== applicationFound._id.toString(),
        );

        // 5. Update JobApplication with the new array
        jobApplication.applications = updatedApplications;
        await jobApplication.save({ validateBeforeSave: false });

        // 6. Delete the application
        const deletedApplicationData = await Application.findByIdAndDelete(
            applicationFound._id,
        ).exec();
        if (!deletedApplicationData) {
            throw new ApiError(
                500,
                "Failed to delete application, please try again",
            );
        }

        // 7. Log success (replace with a proper logger in production)
        console.log(`Application ${applicationId} deleted successfully`);

        // 8. Send success response
        return res
            .status(200)
            .json(
                new ApiResponce(200, null, "Application deleted successfully"),
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
// end of delete applicaiton //

export {
    getAllApplications,
    postApplication,
    viewJobApplication,
    viewMyApplications,
    viewSingleApplication,
    updateApplicationBid,
    deletedApplication,
};
