import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Employee } from "../models/Employee.models/employee.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        console.log(req.cookies);
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        console.log("first", token);

        if (!token) {
            throw new ApiError(401, "Unuathorized Access,Please Log in");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decodedToken);
        const employee = Employee.findById(decodedToken?._id).select(
            "-password -refreshToken",
        );

        if (!employee) {
            throw new ApiError(
                401,
                "invaid user,please login again or create account",
            );
        }

        req.employee = employee;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token");
    }
});
