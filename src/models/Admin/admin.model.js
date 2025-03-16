import mongoose, { Schema } from "mongoose";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const AdminSchema = new Schema(
    {
        // Basic Admin Details
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },

        // Admin Role
        role: {
            type: String,
            enum: ["superadmin", "admin"], // Option for different levels of admin
            default: "admin",
        },

        // Manage Subscriptions
        EmployeeSubscriptions: [
            { type: Schema.Types.ObjectId, ref: "Employee" },
        ],
        EmployerSubscriptions: [
            { type: Schema.Types.ObjectId, ref: "Employer" },
        ],

        // Admin Access to Employees
        employees: [
            {
                type: Schema.Types.ObjectId,
                ref: "Employee",
            },
        ],

        // Admin Access to Employers/Companies
        employers: [
            {
                type: Schema.Types.ObjectId,
                ref: "Employer", // Assuming 'Employer' is another schema/model for companies
            },
        ],

        // Admin Access to Applications
        applications: [
            {
                type: Schema.Types.ObjectId,
                ref: "Application", // Assuming 'Application' is a schema for job applications
            },
        ],

        // Admin Logs (To keep track of actions taken by the admin)
        logs: [
            {
                action: {
                    type: String, // Action description (e.g., "Created new employee", "Deleted employer")
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true },
);

// hash password //
AdminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// to check password is correct
AdminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
// end of check password is correct

// making the access token //
AdminSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            type: "admin",
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    );
};
// making the access token //

// making refresh token //
AdminSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            type: "admin",
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    );
};
// making refresh token //
export const Admin = mongoose.model("Admin", AdminSchema);
