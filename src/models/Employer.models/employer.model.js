import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * ____Employer Schema_____
 */
const EmployerSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        lcoation: {
            type: String,
            required: true,
        },

        authorityName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            requried: true,
        },
        jobApplication: [
            {
                type: Schema.Types.ObjectId,
                ref: "JobApplicaiton",
            },
        ],
        subscription: [
            {
                type: Schema.Types.ObjectId,
                ref: "EmployerSubscription",
            },
        ],
        UIN: {
            type: String,
        },
        GSTIN: {
            type: String,
        },
        DIN: {
            type: String,
        },
    },
    { timestamps: true },
);
/**
 * _____END OF EMPLOYER SCHEMA______
 */

/**
 * ______________________PRE MIDDLEWARES_________________
 */
// hashing password before saving employer //

// using the mongoose middleware //
EmployerSchema.pre("save", async function (next) {
    if (this.password?.isModified("password")) return next(); // checking password is chnged or not
    this.password = bcrypt.hash(this.password, 10);

    next();
});
// end of hashing password before saving employer //

// checking password is correct //
EmployerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
// end of checking password is correct //

/**
 * ______________GENERATING TOKENS___________________
 */

// gnerating access token //
/**
 * Generates a signed JSON Web Token (JWT) for the employer instance.
 *
 * This token is used for authentication and contains essential employer information.
 * The token is signed with a secret key and configured to expire after a specified duration.
 *
 * @returns {string} - A signed JWT containing the employer's unique identifier, email, and name.
 * @JWTfunction : signs
 * @param { id,email,name} -  of employer
 * @load : acesstoken secret and expiery
 */
EmployerSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            type: "employer",
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    );
};
// end of generating access token //

// genrating refresh token //
EmployerSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            type: "employer",
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY,
        },
    );
};

// end of genrating refresh token //
/**
 * ______________ END OF GENERATING TOKENS___________________
 */

export const Employer = mongoose.model("Employer", EmployerSchema);
