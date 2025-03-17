// import mongoose from "mongoose";
// import { Employee } from "../../models/Employee.models/employee.model.js";
// import { Employer } from "../../models/Employer.models/employer.model.js";
// import { JobApplication } from "../../models/Employer.models/jobApplication.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { blockedIPs } from "../../constant.js";

// // View all employees
// const getAllEmployees = asyncHandler(async (req, res) => {
//     const employees = await Employee.find().select("-password");
//     if (!employees.length) throw new ApiError(404, "No employees found");

//     return res
//         .status(200)
//         .json(
//             new ApiResponce(200, employees, "Employees fetched successfully"),
//         );
// });

// // Delete an employee
// const deleteEmployee = asyncHandler(async (req, res) => {
//     const { employeeId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(employeeId))
//         throw new ApiError(400, "Invalid Employee ID");

//     const employee = await Employee.findByIdAndDelete(employeeId);
//     if (!employee) throw new ApiError(404, "Employee not found");

//     return res
//         .status(200)
//         .json(new ApiResponce(200, {}, "Employee deleted successfully"));
// });

// // Block or Unblock Employee
// const toggleEmployeeStatus = asyncHandler(async (req, res) => {
//     const { employeeId } = req.params;
//     const { reason } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(employeeId))
//         throw new ApiError(400, "Invalid Employee ID");
//     const employee = await Employee.findById(employeeId);
//     if (!employee) throw new ApiError(404, "Employee not found");

//     employee.isBlocked = !employee.isBlocked;
//     employee.blockReason = reason || "No reason provided";
//     await employee.save();

//     const status = employee.isBlocked ? "blocked" : "unblocked";
//     return res
//         .status(200)
//         .json(
//             new ApiResponce(200, employee, `Employee ${status} successfully`),
//         );
// });

// // View all employers
// const getAllEmployers = asyncHandler(async (req, res) => {
//     const employers = await Employer.find().select("-password");
//     if (!employers.length) throw new ApiError(404, "No employers found");

//     return res
//         .status(200)
//         .json(
//             new ApiResponce(200, employers, "Employers fetched successfully"),
//         );
// });

// // Delete an employer
// const deleteEmployer = asyncHandler(async (req, res) => {
//     const { employerId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(employerId))
//         throw new ApiError(400, "Invalid Employer ID");

//     const employer = await Employer.findByIdAndDelete(employerId);
//     if (!employer) throw new ApiError(404, "Employer not found");

//     return res
//         .status(200)
//         .json(new ApiResponce(200, {}, "Employer deleted successfully"));
// });

// // Block or Unblock Employer
// const toggleEmployerStatus = asyncHandler(async (req, res) => {
//     const { employerId } = req.params;
//     const { reason } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(employerId))
//         throw new ApiError(400, "Invalid Employer ID");
//     const employer = await Employer.findById(employerId);
//     if (!employer) throw new ApiError(404, "Employer not found");

//     employer.isBlocked = !employer.isBlocked;
//     employer.blockReason = reason || "No reason provided";
//     await employer.save();

//     const status = employer.isBlocked ? "blocked" : "unblocked";
//     return res
//         .status(200)
//         .json(
//             new ApiResponce(200, employer, `Employer ${status} successfully`),
//         );
// });

// // View all job applications
// const getAllJobApplications = asyncHandler(async (req, res) => {
//     const jobApplications = await JobApplication.find();
//     if (!jobApplications.length)
//         throw new ApiError(404, "No job applications found");

//     return res
//         .status(200)
//         .json(
//             new ApiResponce(
//                 200,
//                 jobApplications,
//                 "Job applications fetched successfully",
//             ),
//         );
// });

// // Delete a job application
// const deleteJobApplication = asyncHandler(async (req, res) => {
//     const { applicationId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(applicationId))
//         throw new ApiError(400, "Invalid Application ID");

//     const application = await JobApplication.findByIdAndDelete(applicationId);
//     if (!application) throw new ApiError(404, "Application not found");

//     return res
//         .status(200)
//         .json(new ApiResponce(200, {}, "Application deleted successfully"));
// });

// // Track records (dashboard overview)
// const trackRecords = asyncHandler(async (req, res) => {
//     const totalEmployees = await Employee.countDocuments();
//     const totalEmployers = await Employer.countDocuments();
//     const totalApplications = await JobApplication.countDocuments();

//     return res.status(200).json(
//         new ApiResponce(
//             200,
//             {
//                 totalEmployees,
//                 totalEmployers,
//                 totalApplications,
//             },
//             "Record tracking successful",
//         ),
//     );
// });

// block ip
const blockIP = asyncHandler(async (req, res) => {
    const { ipAddress } = req.body;
    if (!ipAddress) throw new ApiError(400, "IP address is required");

    blockedIPs.add(ipAddress);
    console.log(blockedIPs);
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "IP blocked successfully"));
});

// IP Unblocking
const unblockIP = asyncHandler(async (req, res) => {
    const { ipAddress } = req.body;

    if (!ipAddress) throw new ApiError(400, "IP address is required");
    console.log(blockedIPs);

    if (!blockedIPs.has(ipAddress))
        throw new ApiError(404, "IP address not found in blocked list");

    blockedIPs.delete(ipAddress);
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "IP unblocked successfully"));
});

export {
    // getAllEmployees,
    // deleteEmployee,
    // toggleEmployeeStatus,
    // getAllEmployers,
    // deleteEmployer,
    // toggleEmployerStatus,
    // getAllJobApplications,
    // deleteJobApplication,
    // trackRecords,
    blockIP,
    unblockIP,
};
