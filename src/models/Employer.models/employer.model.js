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
        location: {
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
                ref: "JobApplication",
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
        refreshToken: {
            type: String,
        },
        logo: {
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
/**
 * Pre-save middleware to hash the employer's password before saving it to the database.
 *
 * This middleware runs before saving a new employer document or updating an existing one.
 * It checks if the password field has been modified, and if so, hashes it using bcrypt.
 * This ensures that the password is stored securely as a hash, rather than in plain text.
 *
 * @param {Function} next - A callback function that passes control to the next middleware.
 */

EmployerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    } // checking password is chnged or not
    this.password = await bcrypt.hash(this.password, 10);

    next();
});
// end of hashing password before saving employer //

// checking password is correct //
/**
 * Compares a plain-text password with the hashed password stored in the employer document.
 *
 * This method is used to verify if the provided password matches the hashed password in the database.
 * The bcrypt `compare` method performs a secure comparison without exposing the hashed password.
 *
 * @param {string} password - The plain-text password provided for comparison.
 * @returns {Promise<boolean>} - Resolves to `true` if the passwords match, otherwise `false`.
 */
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
/**
 * Generates a signed JSON Web Token (JWT) to serve as a refresh token for the employer instance.
 *
 * The `jwt.sign` method is used to create the token by encoding the provided payload and signing it with a secret key.
 * It ensures the integrity and authenticity of the token, which can later be verified using the same secret key.
 *
 * @returns {string} - A signed JWT configured as a refresh token.
 * @JWTfunction : signs
 * @param { id} -  of employer
 * @load : refresh secret and expiery
 */
EmployerSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            type: "employer",
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    );
};

// end of genrating refresh token //
/**
 * ______________ END OF GENERATING TOKENS___________________
 */

export const Employer = mongoose.model("Employer", EmployerSchema);
