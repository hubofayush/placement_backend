import mongoose from "mongoose";
import { Employee } from "../../models/Employee.models/employee.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
// import csvParser from "csv-parser";
import fs from "fs";

// View all employees
const getAllEmployees = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
    } = req.query;

    const employees = await Employee.find()
        .sort({ [sortBy]: order === "desc" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select("-password");

    if (!employees.length) throw new ApiError(404, "No employees found");

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                { employees, totalEmployees: employees.length },
                "Employees fetched successfully",
            ),
        );
});

// Delete an employee
const deleteEmployee = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employeeId))
        throw new ApiError(400, "Invalid Employee ID");

    const employee = await Employee.findByIdAndDelete(employeeId);
    if (!employee) throw new ApiError(404, "Employee not found");

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Employee deleted successfully"));
});

// Block/Unblock Employee
const toggleEmployeeStatus = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    const { reason } = req.body;

    if (!employeeId) {
        throw new ApiError(400, "Employee id required");
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId))
        throw new ApiError(400, "Invalid Employee ID");

    const employee = await Employee.findById(employeeId);
    if (!employee) throw new ApiError(404, "Employee not found");

    employee.isBlocked = !employee.isBlocked;
    employee.blockReason = reason || "No reason provided";
    await employee.save({ validateBeforeSave: false });

    const status = employee.isBlocked ? "blocked" : "unblocked";
    return res
        .status(200)
        .json(
            new ApiResponce(200, employee, `Employee ${status} successfully`),
        );
});

// Bulk Upload Employees
// const bulkUploadEmployees = asyncHandler(async (req, res) => {
//     if (!req.file) throw new ApiError(400, "CSV file required for bulk upload");

//     const employees = [];
//     fs.createReadStream(req.file.path)
//         .pipe(csvParser())
//         .on("data", (data) => employees.push(data))
//         .on("end", async () => {
//             await Employee.insertMany(employees);
//             return res
//                 .status(200)
//                 .json(
//                     new ApiResponce(200, {}, "Employees uploaded successfully"),
//                 );
//         });
// });

// Restore Deleted Accounts
const restoreDeletedEmployee = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employeeId))
        throw new ApiError(400, "Invalid Employee ID");

    const employee = await Employee.findOne({ _id: employeeId, deleted: true });
    if (!employee) throw new ApiError(404, "Employee not found or not deleted");

    employee.deleted = false;
    await employee.save();

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                employee,
                "Employee account restored successfully",
            ),
        );
});

export {
    getAllEmployees,
    deleteEmployee,
    toggleEmployeeStatus,
    // bulkUploadEmployees,
    restoreDeletedEmployee,
};
