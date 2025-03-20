import { Employee } from "../../models/Employee.models/employee.model.js";
import { Employer } from "../../models/Employer.models/employer.model.js";
import { JobApplication } from "../../models/Employer.models/jobApplication.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Advanced Search for Records with Filters
const advancedSearch = asyncHandler(async (req, res) => {
    const { type, query, filters } = req.body; // type: 'employee', 'employer', 'application'

    let model;
    switch (type) {
        case "employee":
            model = Employee;
            break;
        case "employer":
            model = Employer;
            break;
        case "application":
            model = JobApplication;
            break;
        default:
            throw new ApiError(400, "Invalid search type");
    }

    const searchCriteria = {};

    if (query) {
        searchCriteria.$text = { $search: query };
    }

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            searchCriteria[key] = value;
        });
    }
    console.log(searchCriteria);
    const results = await model.find(searchCriteria).select("-password");

    if (!results.length) throw new ApiError(404, "No matching records found");

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                results,
                "Search results fetched successfully",
            ),
        );
});

export { advancedSearch };
