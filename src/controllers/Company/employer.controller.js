import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponce } from "../../utils/ApiResponce.js";
import { Employer } from "../../models/Employer.models/employer.model.js";
import { EmployerSubscription } from "../../models/Employer.models/employerSubscription.model.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { Employee } from "../../models/Employee.models/employee.model.js";

/**
 * ________________ Generate Token _____________
 */
const generateToken = async (id) => {
    try {
        const employer = await Employer.findById(id);

        const accessToken = await employer.generateAccessToken();
        const refreshToken = await employer.generateRefreshToken();

        employer.refreshToken = refreshToken;
        employer.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, `Token Generation Failed: ${error.message}`);
    }
};
/**
 * ________________ END OF Generate Token _____________
 */

/**
 * ________________ Register Employer _____________
 */
/**
 * Controller to create a new employer and their associated subscription.
 *
 * This function handles the creation of an employer record in the database,
 * along with an associated subscription record. It uses MongoDB transactions
 * to ensure atomicity, so either all operations succeed or none are applied.
 *
 * Steps:
 * 1. Validate the required fields from the request body.
 * 2. Check for duplicate email to prevent conflicts.
 * 3. Use MongoDB transactions to create the employer and subscription.
 * 4. Commit the transaction on success or roll it back on failure.
 * 5. Return the created employer's details to the client.
 *
 * @async
 * @function createEmployer
 * @param {Object} req - Express request object containing employer details in `req.body`.
 * @param {Object} res - Express response object for sending the HTTP response.
 * @throws {ApiError} Throws an error if validation fails, email is duplicate, or the database operation fails.
 *
 * @returns {Object} - Returns a success response with the newly created employer details.
 */

const createEmployer = asyncHandler(async (req, res) => {
    // Destructure the required fields from the request body
    const {
        name,
        authorityName,
        password,
        email,
        location,
        subscription,
        logo,
    } = req.body;

    // Check if any required fields are missing and throw an error if so
    if (!name || !authorityName || !password || !email || !location) {
        throw new ApiError(400, "all feilds are required");
    }

    // Check if an employer with the same email already exists
    const oldEmployer = await Employer.findOne({ email });
    if (oldEmployer) {
        throw new ApiError(400, "email Already registered");
    }

    // upload logo on cloudinary //
    const logoFile = req.file?.path;

    const logoLocalPath = logoFile;
    if (!logoLocalPath) {
        throw new ApiError(400, "logo required");
    }

    const logoImage = await uploadOnCloudinary(logoLocalPath);
    if (!logoImage) {
        throw new ApiError(400, "Logo failed upload on cloudinary");
    }
    // end of upload logo on cloudinary //

    // Start a new MongoDB session and transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Create a new employer document
        const newEmployer = await Employer.create(
            [
                {
                    name: name,
                    authorityName: authorityName,
                    location: location,
                    password: password,
                    email: email,
                    logo: logoImage?.url,
                },
            ],
            { session },
        );

        // Get the ID of the newly created employer
        const empId = newEmployer[0]._id;

        if (!subscription) {
            throw new ApiError(400, "subscription is required");
        }

        // Prepare the subscription data
        const subscriptionData = {
            employer: empId,
            subscriptionType: subscription,
        };

        // Insert the subscription data into the EmployerSubscription collection
        const [subscriptionRecords] = await Promise.all([
            EmployerSubscription.insertMany(subscriptionData, { session }),
        ]);

        // Associate the subscription records with the new employer
        newEmployer[0].subscription = subscriptionRecords.map((sub) => sub._id);
        await newEmployer[0].save({ session });

        console.log(newEmployer[0]);
        // Commit the transaction and end the session
        await session.commitTransaction();
        session.endSession();

        // Send a success response to the client
        return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    newEmployer,
                    "Employee Register Successfully",
                ),
            );
    } catch (error) {
        // Abort the transaction and end the session in case of an error
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, `Registration Failed: ${error.message}`);
    }
});

/**
 * ________________ END OF Register Employer _____________
 */

/**
 * _______________ Login Employer _______________
 */
const loginEmployer = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Please provide email and password");
    }

    const employer = await Employer.findOne({ email });

    if (!employer) {
        throw new ApiError(400, "Invalid email ");
    }

    const isPasswordCorrect = await employer.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Password");
    }

    const { accessToken, refreshToken } = await generateToken(employer._id);

    const employerData = await Employer.findById(employer._id).select(
        "-password -refreshToken",
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("refreshTokenemp", refreshToken, options)
        .cookie("accessTokenemp", accessToken, options)
        .json(
            new ApiResponce(
                200,
                {
                    employer: employerData,
                    accessToken,
                    refreshToken,
                },
                "Login Successfully",
            ),
        );
});
/**
 * _______________END OF Login Employer _______________
 */
/**
 * _______________ LOG OUT EMPLOYER_______________
 */
const logOutEmployer = asyncHandler(async (req, res) => {
    await Employer.findByIdAndUpdate(
        req.employer?._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            $new: true,
        },
    );

    const options = {
        secure: true,
        httpOnly: true,
    };

    return res
        .status(200)
        .clearCookie("accessTokenemp", options)
        .clearCookie("refreshTokenemp", options)
        .json(new ApiResponce(200, {}, "Employer log out successfully"));
});
/**
 * _______________ END OF LOG OUT EMPLOYER_______________
 */

/**
 * __________ VIEW EMPLOYEE PROFILE ______________
 */
const viewProfile = asyncHandler(async (req, res) => {
    const { empId } = req.params;

    if (!empId) {
        throw new ApiError(400, "Employee ID required");
    }

    if (!mongoose.Types.ObjectId.isValid(empId)) {
        throw new ApiError(400, "Wrong ID");
    }

    const employee = await Employee.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(empId),
            },
        },
        {
            $lookup: {
                from: "experiences",
                localField: "_id",
                foreignField: "employee",
                as: "experience",
            },
        },
        {
            $lookup: {
                from: "locations",
                localField: "location",
                foreignField: "_id",
                as: "currentLocation",
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
            $project: {
                fName: 1,
                lName: 1,
                phone: 1,
                age: 1,
                education: 1,
                experience: 1,
                gender: 1,
                avatar: 1,
                currentLocation: 1,
            },
        },
    ]);

    if (employee.length === 0) {
        throw new ApiError(400, "Invalid ID, please try again");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, employee, "Employee Found"));
});
/**
 * __________ END OF VIEW EMPLOYEE PROFILE ______________
 */
export { createEmployer, loginEmployer, logOutEmployer, viewProfile };
