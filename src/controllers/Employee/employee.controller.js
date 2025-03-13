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
import { EmployeeNotification } from "../../models/Employee.models/employeeNotification.model.js";
import logger from "../../utils/logger.js";
import Api from "twilio/lib/rest/Api.js";
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
        // fetch
        age,
        gender,
        phone,
        password,
        // fetch
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
    if (!fName || !lName || !password || !employed || !dateOfBirth || !gender) {
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
    // const employeeReturn = await Employee.findById(findEmployee._id).select(
    //     "-password -refreshToken",
    // );
    const employeeReturn = await Employee.aggregate([
        {
            $match: {
                _id: findEmployee?._id,
            },
        },
        {
            $lookup: {
                from: "locations",
                localField: "location",
                foreignField: "_id",
                as: "locations",
                pipeline: [
                    {
                        $project: {
                            state: 1,
                            district: 1,
                            subDistrict: 1,
                            pincode: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "experiences",
                localField: "workExperience",
                foreignField: "_id",
                as: "experiences",
                pipeline: [
                    {
                        $project: {
                            yearOfExperience: 1,
                            working: 1,
                            salary: 1,
                            jobRole: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "employeeSubscriptions",
                localField: "subscription",
                foreignField: "_id",
                as: "sunscriptions",
            },
        },
        {
            $project: {
                _id: 1,
                fName: 1,
                lName: 1,
                phone: 1,
                age: 1,
                dateOfBirth: 1,
                gender: 1,
                email: 1,
                avatar: 1,
                leades: 1,
                education: 1,
                locations: 1,
                experiences: 1,
                subscriptions: 1,
            },
        },
    ]);
    // getting new employee with refresh token //

    // setting options for cookies //
    const options = {
        httpOnly: true,
        secure: true,
    };
    // end of setting options for cookies //
    console.log("employee");
    logger.info(`Login attempt from IP: ${req.ip} with phone: ${phone}`);
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
 * ________ SEARCH _______
 */
const search = asyncHandler(async (req, res) => {
    const { q, limit = 10, page = 1, sortBy, sortType } = req.query;

    const parseLimit = parseInt(limit);
    const pageSkip = (page - 1) * parseLimit;
    const sortStage = {};
    sortStage[sortBy] = sortType === "asc" ? 1 : -1;
    console.log(sortStage);
    if (!q) {
        throw new ApiError(400, "Company name Required");
    }

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
                            active: true,
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
        {
            $limit: parseLimit,
        },
        {
            $skip: pageSkip,
        },
        {
            $sort: sortStage,
        },
    ]);
    // end of aggrigation pipeline for finding company//

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
                    {
                        salaryRange: {
                            $regex: `${q}`,
                            $options: "i",
                        },
                    },
                ],
                active: true,
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
        {
            $limit: parseLimit,
        },
        {
            $skip: pageSkip,
        },
        {
            $sort: sortStage,
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
 * ________ SEARCH _______
 */
/**
 * ____________View Company Profile_________
 */
const viewCompany = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    if (!companyId) {
        throw new ApiError(400, "Company Id required");
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new ApiError(400, "Wrong id");
    }

    const company = await Employer.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(companyId),
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
                            active: true,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                name: 1,
                location: 1,
                email: 1,
                applications: 1,
                logo: 1,
            },
        },
    ]);

    if (company.length === 0) {
        throw new ApiError(400, "Invalid Id, Company Not Found");
    }

    return res.status(200).json(new ApiResponce(200, company, "Company Found"));
});
/**
 * ____________ END OF View Company Profile_________
 */

// view all notificatin //
const viewNotifications = asyncHandler(async (req, res) => {
    const notifications = await EmployeeNotification.find({
        employee: req.employee._id,
        read: false,
    });
    if (!notifications) {
        throw new ApiError(400, "no Notificatins");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, notifications, "Notifiactions"));
});
// end of view all notificatin //

// view single Notification //
const readNotifiaction = asyncHandler(async (req, res) => {
    const notificationId = req.params.id;

    if (!notificationId) {
        throw new ApiError(400, "Notification ID Required");
    }

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new ApiError(400, "Invalid notifiaction ID");
    }

    const notification = await EmployeeNotification.findByIdAndUpdate(
        notificationId,
        {
            $set: {
                read: true,
            },
        },
        {
            $new: true,
        },
    );
    if (!notification) {
        throw new ApiError(400, "Not Readed Notification");
    }

    const notificationData = await EmployeeNotification.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(notificationId),
            },
        },
        {
            $lookup: {
                from: "applications",
                localField: "applicationId",
                foreignField: "_id",
                as: "application",
                pipeline: [
                    {
                        $lookup: {
                            from: "jobapplications",
                            foreignField: "_id",
                            localField: "jobApplication",
                            as: "jobApplication",
                        },
                    },
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                { notification, notificationData: notificationData[0] },
                "Notification Red",
            ),
        );
});
// end of view single Notification //
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
    viewCompany,
    viewNotifications,
    readNotifiaction,
};
/**
 * ____ END OF exprting function_________
 */
