import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Employee } from "../models/Employee.models/employee.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // checking the accesstokens which is strored in device or in browser
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unuathorized Access,Please Log in");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // decoding the tokens //

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
