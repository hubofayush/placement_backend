import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Employee } from "../models/employee.model.js";
import {
    uploadOnCloudinary,
    deleteImageOnCloudinary,
} from "../utils/cloudinary.js";

// register employee //
/**
 * Registers a new employee in the system.
 *
 * This function handles the registration of a new employee by validating the input data,
 * checking for existing users, uploading an avatar image, and creating a new employee record.
 *
 * @param {Object} req - The request object containing the employee data.
 * @param {Object} res - The response object used to send the response.
 *
 * @throws {ApiError} If required fields are not filled, if the user already exists,
 *                    if the avatar file is missing, or if the employee could not be registered.
 *
 * @returns {Object} A JSON response with the status and the newly registered employee data.
 */
// const Register = asyncHandler(async (req, res) => {
//     const {
//         fName,
//         lName,
//         age,
//         gender,
//         phone,
//         password,
//         dateOfBirth,
//         experience,
//         position,
//         salary,
//         employed,
//         education,
//         district,
//         division,
//         pincode,
//     } = req.body;

//     console.log(fName, lName, password, employed, dateOfBirth);
//     if (!fName || !lName || !password || !employed || !dateOfBirth) {
//         throw new ApiError(404, "Required feilds not filled");
//     } else {
//     }

//     // checking user already exsist
//     const existEmployee = await Employee.findOne({
//         $or: [{ phone }],
//     });

//     if (existEmployee) {
//         throw new ApiError(400, "user already exist");
//     }
//     // end of checking user already exsist

//     // checking image //
//     // console.log(req.files);
//     const avatarImage = req.file?.path;

//     const avatarLocalPath = avatarImage; // same name as in multer
//     if (!avatarLocalPath) {
//         throw new ApiError(400, "Avatar file is required");
//     }
//     // checking image //

//     // uploading avatar  on cloudinary //
//     const avatar = await uploadOnCloudinary(avatarLocalPath);
//     if (!avatar) {
//         throw new ApiError(400, "Avatar file is required");
//     }
//     // end of uploading avatar on cloudinary //

//     // creating employee
//     const employee = await Employee.create({
//         fName: fName,
//         lName: lName,
//         phone: phone,
//         password: password,
//         age: age,
//         gender: gender,
//         dateOfBirth: dateOfBirth,
//         avatar: avatar.url,
//         workExperience: {
//             experience: experience,
//             position: position,
//             salary: salary,
//             employed: employed,
//         },
//         education: education,
//         lcoation: {
//             district: district,
//             division: division,
//             pincode: pincode,
//         },
//     });

//     // const registerEmployee = await Employee.findById(employee._id);

//     if (!employee) {
//         throw new ApiError(404, "Employee not Registred ");
//     }

//     return res
//         .status(201)
//         .json(new ApiResponce(200, employee, "user registered successfully"));
//     // end of creating employee
// });
// end of register employee //

// !!_________ Register user by transaction__________ //

const Register = asyncHandler(async (req, res) => {
    const {
        fName,
        lName,
        age,
        gender,
        phone,
        password,
        dateOfBirth,
        experience,
        position,
        salary,
        employed,
        education,
        district,
        division,
        pincode,
    } = req.body;

    console.log(fName, lName, password, employed, dateOfBirth);
    if (!fName || !lName || !password || !employed || !dateOfBirth) {
        throw new ApiError(404, "Required feilds not filled");
    } else {
    }

    // checking user already exsist
    const existEmployee = await Employee.findOne({
        $or: [{ phone }],
    });

    if (existEmployee) {
        throw new ApiError(400, "user already exist");
    }
    // end of checking user already exsist

    // checking image //
    // console.log(req.files);
    const avatarImage = req.file?.path;

    const avatarLocalPath = avatarImage; // same name as in multer
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    // checking image //

    // uploading avatar  on cloudinary //
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }
    // end of uploading avatar on cloudinary //

    // creating employee
    const employee = await Employee.create({
        fName: fName,
        lName: lName,
        phone: phone,
        password: password,
        age: age,
        gender: gender,
        dateOfBirth: dateOfBirth,
        avatar: avatar.url,
        workExperience: {
            experience: experience,
            position: position,
            salary: salary,
            employed: employed,
        },
        education: education,
        lcoation: {
            district: district,
            division: division,
            pincode: pincode,
        },
    });

    // const registerEmployee = await Employee.findById(employee._id);

    if (!employee) {
        throw new ApiError(404, "Employee not Registred ");
    }

    return res
        .status(201)
        .json(new ApiResponce(200, employee, "user registered successfully"));
    // end of creating employee
});

// !!_________ End of Register user by transaction__________ //

// login employee //

// !! ________ Log in Employee ________________

/**
 * Handles the login process for an employee.
 *
 * This function checks if the phone number and password are provided in the request body.
 * If either is missing, it throws an authentication error. It then attempts to find the employee
 * by phone number. If the employee is not found, it throws a not found error. If the employee is found,
 * it retrieves the employee's details excluding the password and returns a successful response.
 *
 * @param {Object} req - The request object containing the body with phone and password.
 * @param {Object} res - The response object used to send back the appropriate HTTP response.
 *
 * @throws {ApiError} If phone or password is missing, or if the user is not found.
 *
 * @returns {Object} JSON response with employee details excluding the password.
 */

const loginEmployee = asyncHandler(async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        throw new ApiError(401, "phone or password required");
    }

    const findEmployee = await Employee.findOne({
        phone,
    });

    if (!findEmployee) {
        throw new ApiError(404, "user not found");
    }
    console.log(findEmployee);

    const employeeReturn = await Employee.findById(findEmployee._id).select(
        "-password",
    );

    return res
        .status(200)
        .json(new ApiResponce(200, employeeReturn, "employee found"));
});
// end of login employee //

export { Register, loginEmployee };
