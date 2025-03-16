import { Admin } from "../../models/Admin/admin.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import logger from "../../utils/logger.js";
import mongoose from "mongoose";

// generate access and refresh token function //
const generateToken = async (userId) => {
    // 1 .find user by id
    // 2 generate tokens
    // 3 update employee
    // 4 return access token and refresh token
    // 5 cath errors
    try {
        const admin = await Admin.findById(userId); // finding employee by id

        const accessToken = await admin.generateAccessToken(); // generating access token which is present in model
        // console.log("acceesstoken", accessToken);
        const refreshToken = await admin.generateRefreshToken(); // generating refresh token which is present in model

        admin.refreshToken = refreshToken; // setting refresh token in employee
        await admin.save({ validateBeforeSave: false }); // saving the employee document without validation

        return { accessToken, refreshToken }; // returning tokens
    } catch (error) {
        throw new ApiError(
            500,
            "omething went wrong while genetating access and refresh token",
        );
    }
};
// end of generate access and refresh token function //

// Admin Registration
const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
        throw new ApiError(400, "All fields are required");

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) throw new ApiError(400, "Admin already exists");

    const newAdmin = await Admin.create({
        name,
        email,
        password,
        role: role || "admin",
    });

    if (!newAdmin) {
        throw new ApiError(401, "Registration Failed");
    }

    return res
        .status(201)
        .json(new ApiResponce(201, newAdmin, "Admin registered successfully"));
});

// Admin Login
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, "All fields are required");

    const admin = await Admin.findOne({ email });
    if (!admin) throw new ApiError(404, "Admin not found");

    const isMatch = await admin.isPasswordCorrect(password);
    if (!isMatch) throw new ApiError(401, "Invalid credentials");

    const { accessToken, refreshToken } = await generateToken(admin._id);

    const options = {
        httpOnly: true,
        secure: true,
    };

    // const token = jwt.sign(
    //     { id: admin._id, role: admin.role },
    //     process.env.JWT_SECRET,
    //     { expiresIn: "1d" },
    // );

    logger.info(
        `Login attempt for Admin from IP: ${req.ip} with email : ${email}`,
    );
    return res
        .status(200)
        .cookie("adminAccessToken", accessToken, options)
        .cookie("adminRefreshToken", refreshToken, options)
        .json(
            new ApiResponce(
                200,
                { admin, accessToken, refreshToken },
                "Login successful",
            ),
        );
});

// Admin Password Update
const updateAdminPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword) {
        throw new ApiError(400, "Password is must");
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) throw new ApiError(404, "Admin not found");

    admin.password = newPassword;
    await admin.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Password updated successfully"));
});

// Role Management (Super Admin / Moderator)
const updateAdminRole = asyncHandler(async (req, res) => {
    const { adminId } = req.params;
    const { role } = req.body;

    const validRoles = ["Admin", "Super Admin", "Moderator"];
    if (!validRoles.includes(role))
        throw new ApiError(400, "Invalid role specified");

    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    admin.role = role;
    await admin.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponce(200, admin, "Admin role updated successfully"));
});

export { registerAdmin, loginAdmin, updateAdminPassword, updateAdminRole };
