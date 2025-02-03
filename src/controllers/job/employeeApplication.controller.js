import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { JobApplication } from "../../models/Employer.models/jobApplication.model.js";
import mongoose, { mongo, Mongoose } from "mongoose";
import { Application } from "../../models/Employee.models/application.model.js";
import { uploadOnCloudinaryPDF } from "../../utils/cloudinary.js";

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
// TODO: cant post more than one application to a job application
const postApplication = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const { bid } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "Invalid job id");
    }

    if (!jobId) {
        throw new ApiError(400, "job id needed");
    }

    if (!bid) {
        throw new ApiError(400, "bid is required");
    }

    const job = await JobApplication.findById(jobId);

    if (!job) {
        throw new ApiError(404, "No job found");
    }

    const resumeLocal = req.file?.path;
    const resumeLocalPath = resumeLocal;
    if (!resumeLocalPath) {
        throw new ApiError(400, "Resume file is required");
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
export { getAllApplications, postApplication, viewJobApplication };
