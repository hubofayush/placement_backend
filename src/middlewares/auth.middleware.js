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
        const employee = await Employee.findById(decodedToken?._id).select(
            "-password -refreshToken",
        );

        if (!employee) {
            throw new ApiError(
                401,
                "invaid user,please login again or create account",
            );
        }

        req.employee = employee; // fetched user info is set as coockies
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
