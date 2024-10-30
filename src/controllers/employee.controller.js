import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Employee } from "../models/Employee.models/employee.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { Location } from "../models/location.model.js";
import { Experience } from "../models/Employee.models/experience.model.js";
import jwt from "jsonwebtoken";

/**
 *  __GENERATE TOKENS FUNCTION
 **/
const generateToken = async (userId) => {
    // 1 .find user by id
    // 2 generate tokens
    // 3 update employee
    // 4 return access token and refresh token
    // 5 cath errors
    try {
        const employee = await Employee.findById(userId); // finding employee by id

        const accessToken = await employee.generateAccessToken(); // generating access token which is present in model
        // console.log("acceesstoken", accessToken);
        const refreshToken = await employee.generateRefreshToken(); // generating refresh token which is present in model

        employee.refreshToken = refreshToken; // setting refresh token in employee
        await employee.save({ validateBeforeSave: false }); // saving the employee document without validation

        return { accessToken, refreshToken }; // returning tokens
    } catch (error) {
        throw new ApiError(
            500,
            "omething went wrong while genetating access and refresh token",
        );
    }
};
/**
 *   END OF MAKING GENERATE TOKENS FUNCTION
 **/

//  OLD register employee FUNCTION //

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

/**
 * __________Register user by transaction__________
 **/
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

    //  session creation ** //
    const session = await mongoose.startSession();
    session.startTransaction();
    //  session creation ** //

    // creating employee
    try {
        // creating employee registration //
        const newEmployee = await Employee.create(
            [
                {
                    fName: fName,
                    lName: lName,
                    phone: phone,
                    password: password,
                    age: age,
                    gender: gender,
                    dateOfBirth: dateOfBirth,
                    avatar: avatar.url,
                    education: education,
                },
            ],
            { session },
        );
        // creating employee registration //

        // getting id of created employee //
        const empId = newEmployee[0]._id;
        // getting id of created employee //

        // Create experience records with references to employee //
        const experienceData = {
            employee: empId,
            yearOfExperience: experience,
            working: employed,
            salary: salary,
            jobRole: position,
        };
        // Create experience records with references to employee //
        // Create location records with references to employee //
        const locationData = {
            employee: empId,
            district: district,
            subDistrict: division,
            pincode: pincode,
        };
        // Create location records with references to employee //

        // Create experience,location records with references to employee //
        const [experienceRecords, locationRecords] = await Promise.all([
            Experience.insertMany(experienceData, { session }),
            Location.insertMany(locationData, { session }),
        ]);

        newEmployee[0].workExperience = experienceRecords.map((exp) => exp._id);
        newEmployee[0].location = locationRecords.map((loc) => loc._id);
        await newEmployee[0].save({ session });

        // Create experience,location records with references to employee //
        console.log(newEmployee[0]);
        await session.commitTransaction();
        session.endSession();
        return res
            .status(201)
            .json(
                new ApiResponce(
                    201,
                    newEmployee,
                    "user registered successfully",
                ),
            );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, `Registration failed: ${error.message}`);
    }
});

/**
 *  _________ End of Register user by transaction__________
 **/

/**
 *   ________ Log in Employee __________________
 **/

const loginEmployee = asyncHandler(async (req, res) => {
    // 1. getting data from req
    // 2. validating username or email
    // 3. finding user
    // 4. password check
    // 5. access and refresh token function
    // 6. send coockie

    // getting input //
    const { phone, password } = req.body;
    // end of getting input //

    // validating input //
    if (!phone || !password) {
        throw new ApiError(401, "phone or password required");
    }
    // end of validating input //

    // finding employee by phone number //
    const findEmployee = await Employee.findOne({
        phone,
    });
    // end of finding employee by phone number //

    // throw error on error //
    if (!findEmployee) {
        throw new ApiError(404, "user not found");
    }
    // throw error on error //

    // checking passoword is correct or not //
    const isPasswordValid = await findEmployee.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "invalid password");
    }
    // end of checking passoword is correct or not //

    // generating tolens by id //
    const { accessToken, refreshToken } = await generateToken(findEmployee._id);
    // end of generating tolens by id //

    // getting new employee with refresh token //
    const employeeReturn = await Employee.findById(findEmployee._id).select(
        "-password -refreshToken",
    );
    // getting new employee with refresh token //

    // setting options for cookies //
    const options = {
        httpOnly: true,
        secure: true,
    };
    // end of setting options for cookies //

    // sending responce  //
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(
                200,
                {
                    employee: employeeReturn,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                },
                "employee found",
            ),
        );
    // end of sending responce  //
});
/**
 *  __________END OF LOGIN EMPLOYEE_____________
 **/

export { Register, loginEmployee };
