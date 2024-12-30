import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { JobApplicaiton } from "../../models/Employer.models/jobApplication.model.js";
import mongoose, { Mongoose } from "mongoose";
import { Application } from "../../models/Employee.models/application.model.js";
import { uploadOnCloudinaryPDF } from "../../utils/cloudinary.js";

// get all aplications //
const getAllApplications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortType } = req.query;

    const parsedLimit = parseInt(limit);
    const pageSkip = (page - 1) * parsedLimit;
    const sortStage = {};
    sortStage[sortBy] = sortType === "asc" ? 1 : -1;

    const applications = await JobApplicaiton.find({ status: "Active" })
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

    if (!bid) {
        throw new ApiError(400, "bid is required");
    }

    const job = await JobApplicaiton.findById(jobId);

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

    const newApplication = await Application.create({
        employee: req.employee._id,
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
export { getAllApplications, postApplication };
