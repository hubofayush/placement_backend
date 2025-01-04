import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { Employee } from "../../models/Employee.models/employee.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import mongoose from "mongoose";
import { Location } from "../../models/location.model.js";
import { Experience } from "../../models/Employee.models/experience.model.js";
import { EmployeeSubscription } from "../../models/Employee.models/employeesSbscription.model.js";
import { Employer } from "../../models/Employer.models/employer.model.js";
import { JobApplication } from "../../models/Employer.models/jobApplication.model.js";
// import jwt from "jsonwebtoken";

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

        // create subscription data //
        const subscriptionData = {
            employee: empId,
            subscriptionType: "free",
        };
        // end of create subscription data //

        // Create experience,location records with references to employee //
        const [experienceRecords, locationRecords, subscriptionRecords] =
            await Promise.all([
                Experience.insertMany(experienceData, { session }),
                Location.insertMany(locationData, { session }),
                EmployeeSubscription.insertMany(subscriptionData, { session }),
            ]);

        newEmployee[0].workExperience = experienceRecords.map((exp) => exp._id);
        newEmployee[0].location = locationRecords.map((loc) => loc._id);
        newEmployee[0].subscription = subscriptionRecords.map((sub) => sub._id);
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
                    accessToken,
                    refreshToken,
                },
                "employee found",
            ),
        );
    // end of sending responce  //
});
/**
 *  __________END OF LOGIN EMPLOYEE_____________
 **/

/**
 * ___________LOG OUT EMPLOYEE________________
 */

const logoutEmployee = asyncHandler(async (req, res) => {
    /**
     * 1. find user by id
     * 2. set employees refresh token or accesstoken undefined
     * 3. Update user
     * 4. return responce
     * 5. delete cookies
     */
    // finding employee by id //
    await Employee.findOneAndUpdate(
        req.employee?._id,
        {
            $set: {
                refreshToken: undefined, // updating user //
            },
        },
        {
            new: true,
        },
    );
    // end of finding employee by id //
    const options = {
        httpOnly: true,
        secure: true,
    };
    // return responce //
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponce(200, {}, "Employee logout successfully"));
    // end of return responce //
});

/**
 * ___________END OF LOG OUT EMPLOYEE________________
 */

/**
 * _____________CHANGE PASSWORD____________
 */
const updatePassword = asyncHandler(async (req, res) => {
    /**
     * 1. get new password as input
     * 2. find employee by req employee id
     * 3. update the emplyee and save
     * 4. retrun res
     */

    // getting password from user //
    const { password } = req.body;
    // console.log(password);

    // checking password is available or not //
    if (!password) {
        throw new ApiError(400, "Password Required");
    }
    // end checking password is available or not //

    // findind emplyee by req.employee basically cookie //
    const employee = await Employee.findById(req.employee?._id);
    // end findind emplyee by req.employee basically cookie //

    if (!employee) {
        throw new ApiError(400, {}, "something went wrong while finding user");
    }

    // updating employee password //
    employee.password = password;
    await employee.save({ validateBeforeSave: false }); // not validating user before save //
    // end of updating employee password //

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Password Changed successfully"));
});
/**
 * _____________END OF CHANGE PASSWORD____________
 */

/**
 * _________UPDATE USER INFO________
 */
// TODO: update employeee function
// FIXME: test this end point
const updateEmployee = asyncHandler(async (req, res) => {
    const { name, lastName, mobile, email, adress } = req.body;

    if (!(name, lastName, mobile, email)) {
        throw new ApiError(400, "Feild Required");
    }

    const employee = await Employee.findByIdAndUpdate(
        req.employee?._id,
        {
            $set: {
                fName: name,
                lName: lastName,
                email: email,
                phone: mobile,
            },
        },
        {
            $new: true,
        },
    );

    if (!employee) {
        throw new ApiError(401, "Error on finding error");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, employee, "Updated successfully"));
});
/**
 * ________END OF UPDATE USER________
 */

/**
 * _____ check current user________
 */

const getCurrentUser = asyncHandler(async (req, res) => {
    console.log(req.employee);
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                req.employee,
                "current user fetched successfully",
            ),
        );
});
/**
 * _____END OF check current user________
 */
/**
 * ________ SEARCH company name_______
 * TODO: change this to search feild for anything
 */
const search = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q) {
        throw new ApiError(400, "Company name Required");
    }

    // const company = await Employer.find({
    //     name: {
    //         $regex: `${cName}`,
    //         $options: "i",
    //     },
    // }).select("-password -refreshToken");

    // aggrigation pipeline for finding company//
    const company = await Employer.aggregate([
        {
            $match: {
                $or: [
                    {
                        name: {
                            $regex: `${q}`,
                            $options: "i",
                        },
                    },
                    {
                        location: {
                            $regex: `${q}`,
                            $options: "i",
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "jobapplications",
                localField: "_id",
                foreignField: "owner",
                as: "applications",
                pipeline: [
                    {
                        $match: {
                            status: "Active",
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                numberOfActive: {
                    $size: "$applications",
                },
            },
        },
        {
            $project: {
                name: 1,
                location: 1,
                numberOfActive: 1,
            },
        },
    ]);
    // end of aggrigation pipeline for finding company//
    // if (!company) {
    //     throw new ApiError(400, `NO RESULTS FOUND FOR ${cName}`);
    // }

    // finding job applications realted to search //
    // const jobApplications = await JobApplication.find({
    //     $and: [
    //         {
    //             status: "Active",
    //         },
    //     ],
    //     $or: [
    //         {
    //             title: {
    //                 $regex: `${q}`,
    //                 $options: "i",
    //             },
    //         },
    //         {
    //             companyName: {
    //                 $regex: `${q}`,
    //                 $options: "i",
    //             },
    //         },
    //         {
    //             qualification: {
    //                 $regex: `${q}`,
    //                 $options: "i",
    //             },
    //         },
    //         {
    //             location: {
    //                 $regex: `${q}`,
    //                 $options: "i",
    //             },
    //         },
    //     ],
    // }).select("title companyName salaryRange qualification closeDate");

    const jobApplications = await JobApplication.aggregate([
        {
            $match: {
                $or: [
                    {
                        title: {
                            $regex: `${q}`,
                            $options: "i",
                        },
                    },

                    {
                        companyName: {
                            $regex: `${q}`,
                            $options: "i",
                        },
                    },

                    {
                        qualification: {
                            $regex: `${q}`,
                            $options: "i",
                        },
                    },

                    {
                        location: {
                            $regex: `${q}`,
                            $options: "i",
                        },
                    },
                ],
                status: "Active",
            },
        },
        {
            $project: {
                title: 1,
                location: 1,
                salaryRange: 1,
                qualification: 1,
                companyName: 1,
                closeDate: 1,
            },
        },
    ]);
    // end of finding job applications realted to search //
    return res.status(200).json(
        new ApiResponce(
            200,
            {
                company: company,
                jobApplications: jobApplications,
            },
            "Company details found succsessfully",
        ),
    );
});
/**
 * ________ SEARCH company name_______
 */
/**
 * _________ Exporting functions ___________S
 */
export {
    Register,
    loginEmployee,
    logoutEmployee,
    getCurrentUser,
    updateEmployee,
    updatePassword,
    search,
};
/**
 * ____ END OF exprting function_________
 */
