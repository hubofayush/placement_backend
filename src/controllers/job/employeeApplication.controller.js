import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { JobApplicaiton } from "../../models/Employer.models/jobApplication.model.js";

// get all aplications //
const getAllApplications = asyncHandler(async (req, res) => {
    const applications = await JobApplicaiton.find().select("-owner");
    if (!applications) {
        throw new ApiError(404, "No applications found");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, applications, "All applications"));
});
// end of get all aplications //

export { getAllApplications };
