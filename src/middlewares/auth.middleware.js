import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Employee } from "../models/Employee.models/employee.model.js";
import { Employer } from "../models/Employer.models/employer.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // checking the accesstokens which is strored in device or in browser
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unuathorized Access,Please Log in");
        }

        const decodedToken = await jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
        ); // decoding the tokens //

        // finnding users from decoded token id //
        // const employee = await Employee.findById(decodedToken?._id).select(
        //     "-password -refreshToken",
        // );

        // aggregatjion pipeline //
        const employee = await Employee.aggregate([
            {
                $match: {
                    _id: decodedToken?._id,
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
        // aggregatjion pipeline //

        if (!employee) {
            throw new ApiError(
                401,
                "invaid user,please login again or create account",
            );
        }

        req.employee = employee; // fetched user info is set as coockies
        console.log(req.employee);
        next(); // next midddleware
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token");
    }
});

// verify token for employer //
export const verifyJWTEmployer = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessTokenemp ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(
                400,
                "unauthorized access please login or register",
            );
        }

        const decodedToken = await jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
        );

        const employer = await Employer.findById(decodedToken?._id).select(
            "-password -refreshToken",
        );

        if (!employer) {
            throw new ApiError(401, "invalid user please login or register");
        }

        req.employer = employer;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid accessToken");
    }
});
// verify token for employer //
