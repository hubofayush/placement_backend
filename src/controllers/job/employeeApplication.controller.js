import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { JobApplicaiton } from "../../models/Employer.models/jobApplication.model.js";

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

export { getAllApplications };
