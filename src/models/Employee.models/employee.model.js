import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const EmployeeSchema = new Schema(
    {
        fName: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        lName: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        phone: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
        },
        email: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
        },
        leades: {
            type: Number,
            default: 1,
        },
        workExperience: [
            {
                type: Schema.Types.ObjectId,
                ref: "Experience",
            },
        ],
        education: {
            type: String,
            required: true,
        },
        applications: [
            {
                type: Schema.Types.ObjectId,
                ref: "Application",
            },
        ],
        location: [
            {
                type: Schema.Types.ObjectId,
                ref: "Location",
            },
        ],
        subscription: [
            {
                type: Schema.Types.ObjectId,
                ref: "EmployeeSubscription",
            },
        ],
        refreshToken: {
            type: String,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        blockReason: {
            type: String,
        },
    },
    { timestamps: true },
);

EmployeeSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // checking the password is changed or not
    this.password = await bcrypt.hash(this.password, 10); // to hash password

    next();
});

// to check password is correct
EmployeeSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
// end of check password is correct

// making the access token //
EmployeeSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            type: "employee",
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    );
};
// making the access token //

// making refresh token //
EmployeeSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            type: "employee",
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    );
};
// making refresh token //
export const Employee = mongoose.model("Employee", EmployeeSchema);
