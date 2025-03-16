import { Employee } from "../../models/Employee.models/employee.model.js";
import { Employer } from "../../models/Employer.models/employer.model.js";
import { JobApplication } from "../../models/Employer.models/jobApplication.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Admin Dashboard with Stats
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalEmployees = await Employee.countDocuments();
    const totalBlockedEmployees = await Employee.countDocuments({
        isBlocked: true,
    });
    const totalEmployers = await Employer.countDocuments();
    const totalApplications = await JobApplication.countDocuments();
    const totalActiveApplications = await JobApplication.countDocuments({
        active: true,
    });
    const totalClosedApplications = await JobApplication.countDocuments({
        active: false,
    });

    return res.status(200).json(
        new ApiResponce(
            200,
            {
                totalEmployees,
                totalEmployers,
                totalApplications,
                totalActiveApplications,
                totalClosedApplications,
                totalBlockedEmployees,
            },
            "Dashboard stats fetched successfully",
        ),
    );
});

// Performance Tracking
const getPerformanceTracking = asyncHandler(async (req, res) => {
    // Example: Top Employers by number of job postings
    const topEmployers = await Employer.aggregate([
        {
            $lookup: {
                from: "jobapplications",
                localField: "_id",
                foreignField: "owner",
                as: "jobApplications",
            },
        },
        {
            $project: {
                name: 1,
                jobCount: { $size: "$jobApplications" },
            },
        },
        {
            $sort: { jobCount: -1 },
        },
        {
            $limit: 5,
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                { topEmployers },
                "Performance tracking data fetched successfully",
            ),
        );
});

export { getDashboardStats, getPerformanceTracking };
