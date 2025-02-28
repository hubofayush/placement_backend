import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { JobApplication } from "../../models/Employer.models/jobApplication.model.js";
import mongoose, { mongo, Mongoose } from "mongoose";
import { Application } from "../../models/Employee.models/application.model.js";
import { uploadOnCloudinaryPDF } from "../../utils/cloudinary.js";
import fs from "fs";
// get all aplications //
const getAllApplications = asyncHandler(async (req, res) => {
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
    if (!applications) {
        throw new ApiError(404, "No applications found");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, applications, "All applications"));
});
// end of get all aplications //

// post application for job //
const postApplication = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { bid } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "Invalid job id");
    }

    if (!jobId) {
        throw new ApiError(400, "job id needed");
    }
    const resumeLocal = req.file?.path;
    const resumeLocalPath = resumeLocal;
    if (!resumeLocalPath) {
        throw new ApiError(400, "Resume file is required");
    }
    // checking if employer applicarion is already present //
    const oldApplication = await Application.find({
        employee: new mongoose.Types.ObjectId(req.employee._id),
        jobApplication: jobId,
    });

    if (oldApplication) {
        fs.unlinkSync(resumeLocalPath);
        throw new ApiError(400, "Cant Upload multiple Application");
    }
    // end of checking if employer applicarion is already present //

    if (!bid) {
        throw new ApiError(400, "bid is required");
    }

    const job = await JobApplication.findById(jobId);

    if (!job) {
        throw new ApiError(404, "No job found");
    }
    const resume = await uploadOnCloudinaryPDF(resumeLocalPath);
    if (!resume) {
        throw new ApiError(400, "Resume upload failed on cloudinary");
    }

    // console.log(req.employee);
    const newApplication = await Application.create({
        employee: new mongoose.Types.ObjectId(req.employee._id),
        bid: bid,
        resume: resume.secure_url,
        jobApplication: jobId,
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
});
// end of post application for job //

// view job application //
const viewJobApplication = asyncHandler(async (req, res) => {
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
        throw new ApiError(400, "Job Applicatino not found");
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
});
// end of view job application //

// view posted applications //
const viewMyApplications = asyncHandler(async (req, res) => {
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

    if (jobApplications.length === null) {
        return res
            .status(200)
            .json(new ApiResponce(200, [], "No Application Found"));
    }

    return res
        .status(200)
        .json(new ApiResponce(200, jobApplications, "Applications Found"));
});
// end of view posted applications //

// view single application //
const viewSingleApplication = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    if (!applicationId) {
        throw new ApiError(400, "Applicarion ID required");
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
                jobApplicationInfo: applicationInfo[0].jobApplicationInfo[0],
            },
            "Applicatin Found Successfull",
        ),
    );
});
// end of view single application //
export {
    getAllApplications,
    postApplication,
    viewJobApplication,
    viewMyApplications,
    viewSingleApplication,
};
