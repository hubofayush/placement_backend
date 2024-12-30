import mongoose from "mongoose";
import { JobApplicaiton } from "../../models/Employer.models/jobApplication.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// generate job application controller //
const postApplication = asyncHandler(async (req, res) => {
    const {
        status,
        title,
        description,
        openings,
        location,
        salaryRange,
        jobType,
        qualification,
        jobHours,
        instructions,
        contactInfo,
        reviewDate,
        closeDate,
    } = req.body;

    if (
        !title ||
        !description ||
        !openings ||
        !location ||
        !qualification ||
        !instructions ||
        !contactInfo ||
        !closeDate ||
        !jobType ||
        !salaryRange ||
        !jobHours
    ) {
        throw new ApiError(400, "all feilds are required");
    }

    const newJob = await JobApplicaiton.create({
        companyName: req.employer?.name,
        title: title,
        closeDate: closeDate,
        owner: req.employer,
        description: description,
        openings: Number(openings),
        location: location,
        salaryRange: salaryRange,
        jobType: jobType,
        jobHours: Number(jobHours),
        instructions: instructions,
        qualification: qualification,
        contactInfo: contactInfo,
    });

    if (!newJob) {
        throw new ApiError(401, "Job Application not created");
    }

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                { newJob: newJob },
                "job created successfully",
            ),
        );
});
// end of generate job application controller //

// get my applications //
const getMyApplications = asyncHandler(async (req, res) => {
    const myApplications = await JobApplicaiton.find({ owner: req.employer });

    if (!myApplications) {
        throw new ApiError(400, "No applications found");
    }

    return res.status(200).json(
        new ApiResponce(
            200,
            {
                myApplications: myApplications,
                total: myApplications.length,
            },
            "applications found",
        ),
    );
});
// end of get my applications //

// delete job applicaton //
const deleteJobApplication = asyncHandler(async (req, res) => {
    const jobApplicationId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobApplicationId)) {
        throw new ApiError(400, "Invalid job application id");
    }

    const jobApplication =
        await JobApplicaiton.findByIdAndDelete(jobApplicationId);

    if (!jobApplication) {
        throw new ApiError(400, "No job application found");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Job application deleted successfully"));
});
// end of delete job applicaton //
export { postApplication, getMyApplications, deleteJobApplication };
