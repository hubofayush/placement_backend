import { Admin } from "../../models/Admin/admin.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new ApiError(401, "Invalid credentials");

    const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
    );
    return res
        .status(200)
        .json(new ApiResponce(200, { token }, "Login successful"));
});

// Admin Password Update
const updateAdminPassword = asyncHandler(async (req, res) => {
    const { adminId } = req.params;
    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) throw new ApiError(401, "Old password is incorrect");

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

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
    await admin.save();

    return res
        .status(200)
        .json(new ApiResponce(200, admin, "Admin role updated successfully"));
});

export { registerAdmin, loginAdmin, updateAdminPassword, updateAdminRole };
