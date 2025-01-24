import mongoose, { Schema } from "mongoose";
import { JobApplication } from "../../models/Employer.models/jobApplication.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// generate job application controller //
const postApplication = asyncHandler(async (req, res) => {
    const {
        active,
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

    console.log(req.body);

    const newJob = await JobApplication.create({
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
        active: active,
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
    const myApplications = await JobApplication.find({ owner: req.employer });

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
        await JobApplication.findByIdAndDelete(jobApplicationId);

    if (!jobApplication) {
        throw new ApiError(400, "No job application found");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Job application deleted successfully"));
});
// end of delete job applicaton //

// update job application //
const updateJobApplication = asyncHandler(async (req, res) => {
    const {
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

    const jobId = req.params.id;
    if (!jobId) {
        throw new ApiError(400, "Job Id required");
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "invalid job applicaiton id");
    }

    const oldJobApplication = await JobApplication.findById(jobId);
    if (!oldJobApplication) {
        throw new ApiError(400, "No job application found");
    }

    const jobApplicationData = {
        title: title ?? oldJobApplication.title,
        description: description ?? oldJobApplication.description,
        openings: openings ?? oldJobApplication.openings,
        location: location ?? oldJobApplication.location,
        salaryRange: salaryRange ?? oldJobApplication.salaryRange,
        jobType: jobType ?? oldJobApplication.jobType,
        qualification: qualification ?? oldJobApplication.qualification,
        jobHours: jobHours ?? oldJobApplication.jobHours,
        instructions: instructions ?? oldJobApplication.instructions,
        contactInfo: contactInfo ?? oldJobApplication.contactInfo,
        reviewDate: reviewDate ?? oldJobApplication.reviewDate,
        closeDate: closeDate ?? oldJobApplication.closeDate,
    };

    const updatedJobApplication = await JobApplication.findByIdAndUpdate(
        jobId,
        {
            $set: jobApplicationData,
        },
        {
            new: true,
        },
    );

    if (!updatedJobApplication) {
        throw new ApiError(400, "Cant update job application");
    }

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                updatedJobApplication,
                "Application updated successfully",
            ),
        );
});
// update job application //

// toggle job status //
const changeJobStatus = asyncHandler(async (req, res) => {
    const jobId = req.params.id;

    if (!jobId) {
        throw new ApiError(400, "Job application id required");
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "invalid jobapplication id");
    }

    const newjobApplication = await JobApplication.findById(jobId);

    if (!newjobApplication) {
        throw new ApiError(400, "invalid job ID, Job application not found");
    }

    if (!newjobApplication.owner.equals(req.employer?._id)) {
        throw new ApiError(400, "Invalid access , access denied");
    }

    newjobApplication.active = !newjobApplication.active;
    newjobApplication.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                newjobApplication,
                "Status changed successfully",
            ),
        );
});
// toggle job status //



// view job request applications //
const viewJobApplicationsRequests = asyncHandler(async (req, res) => {
    const jobId = req.params.id;
    if (!jobId) {
        throw new ApiError(400, "Job application id required");
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "invalid jobapplication id");
    }

    const jobApplicationRequests = await JobApplication.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(jobId),
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

// end of view job request applications //

export {
    postApplication,
    getMyApplications,
    deleteJobApplication,
    changeJobStatus,
    updateJobApplication,
    viewJobApplicationsRequests,
};
