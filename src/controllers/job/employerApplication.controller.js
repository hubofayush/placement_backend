import mongoose, { Schema } from "mongoose";
import { JobApplication } from "../../models/Employer.models/jobApplication.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Application } from "../../models/Employee.models/application.model.js";
import { Employee } from "../../models/Employee.models/employee.model.js";
import { AvailablePhoneNumberCountryInstance } from "twilio/lib/rest/api/v2010/account/availablePhoneNumberCountry.js";
import { ShortlistedApplication } from "../../models/Employer.models/shortlistedApplication.model.js";

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

// view one application //
const viewSingleApplication = asyncHandler(async (req, res) => {
    const applicationID = req.params.id;

    if (!applicationID) {
        throw new ApiError(400, "Application ID required");
    }

    if (!mongoose.Types.ObjectId.isValid(applicationID)) {
        throw new ApiError(400, '"Invalid Application ID');
    }

    const newApplication = await Application.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(applicationID),
            },
        },
        {
            $lookup: {
                from: "employees",
                localField: "employee",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "experiences",
                            localField: "workExperience",
                            foreignField: "_id",
                            as: "workExperience",
                        },
                    },
                    {
                        $lookup: {
                            from: "employeesubscriptions",
                            localField: "subscription",
                            foreignField: "_id",
                            as: "subscription",
                        },
                    },
                    {
                        $lookup: {
                            from: "locations",
                            localField: "location",
                            foreignField: "_id",
                            as: "location",
                        },
                    },
                    {
                        $project: {
                            avatar: 1,
                            fName: 1,
                            lName: 1,
                            phone: 1,
                            email: 1,
                            workExperience: 1,
                            subscription: 1,
                            location: 1,
                            age: 1,
                        },
                    },
                    {
                        $sort: {
                            createdAt: -1,
                        },
                    },
                ],
            },
        },
    ]);

    if (newApplication.length === 0) {
        throw new ApiError(400, "Application Not Found");
    }

    // return res.redirect(newApplication[0].resume);
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                newApplication,
                "application found successfully",
            ),
        );
});
// end of view one application //

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

// select Job Applicaion //
const shortListApplication = asyncHandler(async (req, res) => {
    const { appID, jobID } = req.query;
    if (!appID || !jobID) {
        throw new ApiError(400, "Application ID and Job ID required");
    }

    if (
        !mongoose.Types.ObjectId.isValid(appID) ||
        !mongoose.Types.ObjectId.isValid(jobID)
    ) {
        throw new ApiError(400, "Invalid Id");
    }

    let data = {
        jobApplication: jobID,
        application: appID,
    };

    const newshortlistedApplication =
        await ShortlistedApplication.findOne(data);

    if (!newshortlistedApplication) {
        const shortList = await ShortlistedApplication.create(data);
        if (!shortList) {
            throw new ApiError(404, " shortlisting application error");
        }

        return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    shortList,
                    "Application shortlisted successfully",
                ),
            );
    } else {
        const unShortList = await ShortlistedApplication.findOneAndDelete(data);

        if (!unShortList) {
            throw new ApiError(404, "unshortlisting application error");
        }

        return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    unShortList,
                    "Application unshortlisted successfully",
                ),
            );
    }
});
// end of select Job Applicaion //

// view shortlisted applications //
const viewShortlistedApplications = asyncHandler(async (req, res) => {
    const jobID = req.params.id;

    if (!jobID) {
        throw new ApiError(400, "Job ID required");
    }

    if (!mongoose.Types.ObjectId.isValid(jobID)) {
        throw new ApiError(400, "Invalid Id");
    }

    // const shortlistedApplications = await ShortlistedApplication.find({
    //     jobApplication: jobID,
    // });

    const shortlistedApplications = await ShortlistedApplication.aggregate([
        {
            $match: {
                jobApplication: new mongoose.Types.ObjectId(jobID),
            },
        },
        {
            $lookup: {
                from: "applications",
                foreignField: "_id",
                localField: "application",
                as: "application",
                pipeline: [
                    {
                        $lookup: {
                            from: "employees",
                            foreignField: "_id",
                            localField: "employee",
                            as: "employee",
                            pipeline: [
                                {
                                    $project: {
                                        fName: 1,
                                        lName: 1,
                                        avatar: 1,
                                        phone: 1,
                                        email: 1,
                                        education: 1,
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ]);

    if (!shortlistedApplications) {
        throw new ApiError(400, "No shortlisted applications found");
    }

    return res
        .status(200)
        .json(
            new ApiResponce(200, shortlistedApplications, "Applications Found"),
        );
});
// end of shortlisted applicaitons //

export {
    postApplication,
    getMyApplications,
    deleteJobApplication,
    changeJobStatus,
    updateJobApplication,
    viewJobApplicationsRequests,
    viewSingleApplication,
    shortListApplication,
    viewShortlistedApplications,
};
